using Microsoft.EntityFrameworkCore;
using UniReserve.Api.Data;
using UniReserve.Api.DTOs;
using UniReserve.Api.Models;

namespace UniReserve.Api.Services;

public class ReservationService : IReservationService
{
    private readonly ApplicationDbContext _db;

    public ReservationService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<(List<ReservationResponseDto> Items, int TotalCount)> GetReservationsAsync(ReservationQueryParameters parameters)
    {
        var query = _db.Reservations
            .Include(r => r.User)
            .Include(r => r.Equipment)
                .ThenInclude(e => e!.Category)
            .AsQueryable();

        if (parameters.Status.HasValue)
        {
            query = query.Where(r => r.Status == parameters.Status.Value);
        }

        if (parameters.UserId.HasValue && parameters.UserId.Value != Guid.Empty)
        {
            query = query.Where(r => r.UserId == parameters.UserId.Value);
        }

        if (parameters.EquipmentId.HasValue && parameters.EquipmentId.Value != Guid.Empty)
        {
            query = query.Where(r => r.EquipmentId == parameters.EquipmentId.Value);
        }

        if (!string.IsNullOrWhiteSpace(parameters.Search))
        {
            var search = parameters.Search.Trim().ToLower();
            query = query.Where(r =>
                r.ReservationNumber.ToLower().Contains(search) ||
                (r.User != null && (r.User.FullName.ToLower().Contains(search) || r.User.Email.ToLower().Contains(search) || (r.User.StudentId != null && r.User.StudentId.ToLower().Contains(search)))) ||
                (r.Equipment != null && (r.Equipment.Name.ToLower().Contains(search) || r.Equipment.AssetTag.ToLower().Contains(search))));
        }

        if (parameters.FromDate.HasValue)
        {
            var from = parameters.FromDate.Value.ToUniversalTime();
            query = query.Where(r => r.EndDateTime >= from);
        }

        if (parameters.ToDate.HasValue)
        {
            var to = parameters.ToDate.Value.ToUniversalTime();
            query = query.Where(r => r.StartDateTime <= to);
        }

        var totalCount = await query.CountAsync();

        var items = await query
            .OrderByDescending(r => r.CreatedAt)
            .Skip((parameters.Page - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .ToListAsync();

        return (items.Select(MapToDto).ToList(), totalCount);
    }

    public async Task<List<ReservationResponseDto>> GetUserReservationsAsync(Guid userId, ReservationStatus? status = null)
    {
        var query = _db.Reservations
            .Include(r => r.User)
            .Include(r => r.Equipment)
                .ThenInclude(e => e!.Category)
            .Where(r => r.UserId == userId);

        if (status.HasValue)
        {
            query = query.Where(r => r.Status == status.Value);
        }

        var items = await query.OrderByDescending(r => r.CreatedAt).ToListAsync();
        return items.Select(MapToDto).ToList();
    }

    public async Task<ReservationResponseDto?> GetReservationByIdAsync(Guid id)
    {
        var res = await _db.Reservations
            .Include(r => r.User)
            .Include(r => r.Equipment)
                .ThenInclude(e => e!.Category)
            .FirstOrDefaultAsync(r => r.Id == id);

        return res == null ? null : MapToDto(res);
    }

    public async Task<ReservationResponseDto> CreateReservationAsync(Guid userId, CreateReservationDto dto)
    {
        var startUtc = dto.StartDateTime.ToUniversalTime();
        var endUtc = dto.EndDateTime.ToUniversalTime();

        if (startUtc >= endUtc)
        {
            throw new InvalidOperationException("End date/time must be strictly after Start date/time.");
        }

        // Allow max 10 minutes buffer for slight clock differences, but reject past bookings
        if (startUtc < DateTime.UtcNow.AddMinutes(-15))
        {
            throw new InvalidOperationException("Reservation start time cannot be in the past.");
        }

        var equipment = await _db.Equipment
            .Include(e => e.Category)
            .FirstOrDefaultAsync(e => e.Id == dto.EquipmentId && e.IsActive);

        if (equipment == null)
        {
            throw new KeyNotFoundException("Equipment not found or is currently inactive.");
        }

        if (equipment.Status == EquipmentStatus.Maintenance)
        {
            throw new InvalidOperationException("This equipment is currently under maintenance and cannot be reserved.");
        }

        if (equipment.Status == EquipmentStatus.Retired)
        {
            throw new InvalidOperationException("This equipment has been retired.");
        }

        var durationDays = (endUtc - startUtc).TotalDays;
        if (durationDays > equipment.MaxBorrowDays)
        {
            throw new InvalidOperationException($"The maximum allowed borrow duration for this item is {equipment.MaxBorrowDays} day(s). Requested: {Math.Ceiling(durationDays)} day(s).");
        }

        // Check for conflicting overlapping bookings
        // Overlap formula: (existing.Start < requested.End) AND (existing.End > requested.Start)
        var conflictingActiveCount = await _db.Reservations
            .Where(r => r.EquipmentId == dto.EquipmentId &&
                        (r.Status == ReservationStatus.Approved || r.Status == ReservationStatus.CheckedOut || r.Status == ReservationStatus.Pending) &&
                        r.StartDateTime < endUtc &&
                        r.EndDateTime > startUtc)
            .SumAsync(r => (int?)r.Quantity) ?? 0;

        if (conflictingActiveCount + dto.Quantity > equipment.TotalQuantity)
        {
            throw new InvalidOperationException($"Not enough units available for the selected dates. Maximum capacity: {equipment.TotalQuantity}, Booked during period: {conflictingActiveCount}, Requested: {dto.Quantity}.");
        }

        var resNumber = await GenerateUniqueReservationNumberAsync();

        var reservation = new Reservation
        {
            ReservationNumber = resNumber,
            UserId = userId,
            EquipmentId = dto.EquipmentId,
            StartDateTime = startUtc,
            EndDateTime = endUtc,
            Quantity = dto.Quantity,
            Purpose = dto.Purpose.Trim(),
            Notes = dto.Notes?.Trim(),
            Status = ReservationStatus.Pending,
            CreatedAt = DateTime.UtcNow
        };

        _db.Reservations.Add(reservation);

        // Audit Log
        _db.AuditLogs.Add(new AuditLog
        {
            UserId = userId,
            Action = "CREATE_RESERVATION",
            EntityType = "Reservation",
            EntityId = reservation.Id.ToString(),
            Details = $"Created reservation {resNumber} for {equipment.Name} from {startUtc:g} to {endUtc:g}",
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();

        var user = await _db.Users.FindAsync(userId);
        reservation.User = user;
        reservation.Equipment = equipment;

        return MapToDto(reservation);
    }

    public async Task<ReservationResponseDto> UpdateReservationStatusAsync(Guid reservationId, UpdateReservationStatusDto dto, Guid? adminUserId = null)
    {
        var res = await _db.Reservations
            .Include(r => r.User)
            .Include(r => r.Equipment)
                .ThenInclude(e => e!.Category)
            .FirstOrDefaultAsync(r => r.Id == reservationId);

        if (res == null)
        {
            throw new KeyNotFoundException("Reservation not found.");
        }

        var oldStatus = res.Status;
        res.Status = dto.Status;

        if (dto.Status == ReservationStatus.Approved)
        {
            res.ApprovedAt = DateTime.UtcNow;
            if (!string.IsNullOrEmpty(dto.AdminNotes)) res.AdminNotes = dto.AdminNotes;
        }
        else if (dto.Status == ReservationStatus.CheckedOut)
        {
            res.CheckedOutAt = DateTime.UtcNow;
            if (!string.IsNullOrEmpty(dto.AdminNotes)) res.AdminNotes = dto.AdminNotes;
        }
        else if (dto.Status == ReservationStatus.Returned)
        {
            res.ReturnedAt = DateTime.UtcNow;
            res.ReturnConditionNotes = dto.ReturnConditionNotes;
            if (!string.IsNullOrEmpty(dto.AdminNotes)) res.AdminNotes = dto.AdminNotes;
        }
        else if (dto.Status == ReservationStatus.Rejected)
        {
            res.RejectionReason = dto.RejectionReason;
            if (!string.IsNullOrEmpty(dto.AdminNotes)) res.AdminNotes = dto.AdminNotes;
        }

        _db.AuditLogs.Add(new AuditLog
        {
            UserId = adminUserId,
            Action = "UPDATE_RESERVATION_STATUS",
            EntityType = "Reservation",
            EntityId = res.Id.ToString(),
            Details = $"Changed reservation {res.ReservationNumber} status from {oldStatus} to {dto.Status}",
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
        return MapToDto(res);
    }

    public async Task<ReservationResponseDto> CancelReservationAsync(Guid reservationId, Guid userId, bool isAdmin, CancelReservationDto? dto = null)
    {
        var res = await _db.Reservations
            .Include(r => r.User)
            .Include(r => r.Equipment)
                .ThenInclude(e => e!.Category)
            .FirstOrDefaultAsync(r => r.Id == reservationId);

        if (res == null)
        {
            throw new KeyNotFoundException("Reservation not found.");
        }

        if (!isAdmin && res.UserId != userId)
        {
            throw new UnauthorizedAccessException("You are not authorized to cancel this reservation.");
        }

        if (res.Status == ReservationStatus.Returned || res.Status == ReservationStatus.Cancelled || res.Status == ReservationStatus.Rejected)
        {
            throw new InvalidOperationException($"Cannot cancel a reservation that is already {res.Status}.");
        }

        if (res.Status == ReservationStatus.CheckedOut && !isAdmin)
        {
            throw new InvalidOperationException("Checked-out items cannot be cancelled by students. Please return the item to the tech desk.");
        }

        res.Status = ReservationStatus.Cancelled;
        res.CancelledAt = DateTime.UtcNow;
        if (!string.IsNullOrEmpty(dto?.Reason))
        {
            res.Notes = string.IsNullOrEmpty(res.Notes) ? $"Cancellation Reason: {dto.Reason}" : $"{res.Notes} | Cancellation Reason: {dto.Reason}";
        }

        _db.AuditLogs.Add(new AuditLog
        {
            UserId = userId,
            Action = "CANCEL_RESERVATION",
            EntityType = "Reservation",
            EntityId = res.Id.ToString(),
            Details = $"Cancelled reservation {res.ReservationNumber}. Reason: {dto?.Reason ?? "None provided"}",
            CreatedAt = DateTime.UtcNow
        });

        await _db.SaveChangesAsync();
        return MapToDto(res);
    }

    public async Task<AvailabilityResultDto> CheckAvailabilityAsync(AvailabilityCheckRequestDto request)
    {
        var startUtc = request.StartDateTime.ToUniversalTime();
        var endUtc = request.EndDateTime.ToUniversalTime();

        var equipment = await _db.Equipment.FirstOrDefaultAsync(e => e.Id == request.EquipmentId && e.IsActive);
        if (equipment == null)
        {
            return new AvailabilityResultDto
            {
                IsAvailable = false,
                TotalQuantity = 0,
                ConflictingReservationsCount = 0,
                RemainingAvailable = 0,
                Message = "Equipment not found or inactive."
            };
        }

        if (equipment.Status == EquipmentStatus.Maintenance || equipment.Status == EquipmentStatus.Retired)
        {
            return new AvailabilityResultDto
            {
                IsAvailable = false,
                TotalQuantity = equipment.TotalQuantity,
                ConflictingReservationsCount = 0,
                RemainingAvailable = 0,
                Message = $"Equipment is currently {equipment.Status}."
            };
        }

        var conflictingCount = await _db.Reservations
            .Where(r => r.EquipmentId == request.EquipmentId &&
                        (r.Status == ReservationStatus.Approved || r.Status == ReservationStatus.CheckedOut || r.Status == ReservationStatus.Pending) &&
                        r.StartDateTime < endUtc &&
                        r.EndDateTime > startUtc)
            .SumAsync(r => (int?)r.Quantity) ?? 0;

        var remaining = Math.Max(0, equipment.TotalQuantity - conflictingCount);

        return new AvailabilityResultDto
        {
            IsAvailable = remaining > 0,
            TotalQuantity = equipment.TotalQuantity,
            ConflictingReservationsCount = conflictingCount,
            RemainingAvailable = remaining,
            Message = remaining > 0 ? $"Available! {remaining} unit(s) in stock for selected dates." : "All units are booked for this time period."
        };
    }

    private async Task<string> GenerateUniqueReservationNumberAsync()
    {
        var year = DateTime.UtcNow.Year;
        var random = new Random();
        for (int i = 0; i < 10; i++)
        {
            var code = $"RES-{year}-{random.Next(10000, 99999)}";
            var exists = await _db.Reservations.AnyAsync(r => r.ReservationNumber == code);
            if (!exists) return code;
        }
        return $"RES-{year}-{Guid.NewGuid().ToString().Substring(0, 6).ToUpper()}";
    }

    private static ReservationResponseDto MapToDto(Reservation r)
    {
        var canCancel = r.Status == ReservationStatus.Pending || r.Status == ReservationStatus.Approved;

        return new ReservationResponseDto
        {
            Id = r.Id,
            ReservationNumber = r.ReservationNumber,
            UserId = r.UserId,
            UserName = r.User?.FullName ?? "Unknown User",
            UserEmail = r.User?.Email ?? string.Empty,
            StudentId = r.User?.StudentId,
            Department = r.User?.Department,
            PhoneNumber = r.User?.PhoneNumber,
            
            EquipmentId = r.EquipmentId,
            EquipmentName = r.Equipment?.Name ?? "Unknown Item",
            EquipmentAssetTag = r.Equipment?.AssetTag ?? "N/A",
            EquipmentImageUrl = r.Equipment?.ImageUrl ?? string.Empty,
            CategoryName = r.Equipment?.Category?.Name ?? "General",
            Location = r.Equipment?.Location ?? "Tech Hub",

            StartDateTime = r.StartDateTime,
            EndDateTime = r.EndDateTime,
            Quantity = r.Quantity,
            Purpose = r.Purpose,
            Notes = r.Notes,
            Status = r.Status.ToString(),
            RejectionReason = r.RejectionReason,
            AdminNotes = r.AdminNotes,
            ReturnConditionNotes = r.ReturnConditionNotes,

            CreatedAt = r.CreatedAt,
            ApprovedAt = r.ApprovedAt,
            CheckedOutAt = r.CheckedOutAt,
            ReturnedAt = r.ReturnedAt,
            CancelledAt = r.CancelledAt,
            CanCancel = canCancel
        };
    }
}
