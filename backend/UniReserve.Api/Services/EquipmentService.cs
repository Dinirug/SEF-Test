using Microsoft.EntityFrameworkCore;
using UniReserve.Api.Data;
using UniReserve.Api.DTOs;
using UniReserve.Api.Models;

namespace UniReserve.Api.Services;

public class EquipmentService : IEquipmentService
{
    private readonly ApplicationDbContext _db;

    public EquipmentService(ApplicationDbContext db)
    {
        _db = db;
    }

    public async Task<(List<EquipmentResponseDto> Items, int TotalCount)> GetEquipmentListAsync(EquipmentQueryParameters parameters)
    {
        var query = _db.Equipment
            .Include(e => e.Category)
            .Include(e => e.Reservations)
            .Where(e => e.IsActive)
            .AsQueryable();

        // Search
        if (!string.IsNullOrWhiteSpace(parameters.Search))
        {
            var search = parameters.Search.Trim().ToLower();
            query = query.Where(e =>
                e.Name.ToLower().Contains(search) ||
                e.AssetTag.ToLower().Contains(search) ||
                (e.ModelNumber != null && e.ModelNumber.ToLower().Contains(search)) ||
                e.Description.ToLower().Contains(search) ||
                e.Location.ToLower().Contains(search));
        }

        // Category Filter
        if (parameters.CategoryId.HasValue && parameters.CategoryId.Value != Guid.Empty)
        {
            query = query.Where(e => e.CategoryId == parameters.CategoryId.Value);
        }

        // Status Filter
        if (parameters.Status.HasValue)
        {
            query = query.Where(e => e.Status == parameters.Status.Value);
        }

        // Location Filter
        if (!string.IsNullOrWhiteSpace(parameters.Location))
        {
            query = query.Where(e => e.Location.ToLower().Contains(parameters.Location.ToLower()));
        }

        // Date Range Availability Check (if requested)
        if (parameters.AvailableFrom.HasValue && parameters.AvailableTo.HasValue)
        {
            var from = parameters.AvailableFrom.Value.ToUniversalTime();
            var to = parameters.AvailableTo.Value.ToUniversalTime();

            // Filter out items that are under maintenance or retired
            query = query.Where(e => e.Status != EquipmentStatus.Maintenance && e.Status != EquipmentStatus.Retired);
        }

        var totalCount = await query.CountAsync();

        // Sorting
        query = parameters.SortBy?.ToLower() switch
        {
            "date" => parameters.SortDescending ? query.OrderByDescending(e => e.CreatedAt) : query.OrderBy(e => e.CreatedAt),
            "popular" => query.OrderByDescending(e => e.Reservations.Count),
            _ => parameters.SortDescending ? query.OrderByDescending(e => e.Name) : query.OrderBy(e => e.Name)
        };

        var pagedItems = await query
            .Skip((parameters.Page - 1) * parameters.PageSize)
            .Take(parameters.PageSize)
            .ToListAsync();

        var dtos = pagedItems.Select(e => MapToDto(e)).ToList();

        return (dtos, totalCount);
    }

    public async Task<EquipmentResponseDto?> GetEquipmentByIdAsync(Guid id)
    {
        var item = await _db.Equipment
            .Include(e => e.Category)
            .Include(e => e.Reservations)
            .FirstOrDefaultAsync(e => e.Id == id && e.IsActive);

        return item == null ? null : MapToDto(item);
    }

    public async Task<EquipmentResponseDto> CreateEquipmentAsync(EquipmentCreateDto dto)
    {
        var category = await _db.Categories.FindAsync(dto.CategoryId);
        if (category == null)
        {
            throw new ArgumentException("Invalid category ID");
        }

        var equipment = new Equipment
        {
            Name = dto.Name,
            CategoryId = dto.CategoryId,
            AssetTag = dto.AssetTag.Trim().ToUpper(),
            ModelNumber = dto.ModelNumber,
            SerialNumber = dto.SerialNumber,
            Description = dto.Description,
            Specifications = dto.Specifications,
            ImageUrl = dto.ImageUrl,
            Location = dto.Location,
            Status = dto.Status,
            TotalQuantity = dto.TotalQuantity,
            AvailableQuantity = dto.TotalQuantity,
            MaxBorrowDays = dto.MaxBorrowDays,
            TermsAndConditions = dto.TermsAndConditions,
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Equipment.Add(equipment);
        await _db.SaveChangesAsync();

        equipment.Category = category;
        return MapToDto(equipment);
    }

    public async Task<EquipmentResponseDto?> UpdateEquipmentAsync(Guid id, EquipmentUpdateDto dto)
    {
        var equipment = await _db.Equipment
            .Include(e => e.Category)
            .Include(e => e.Reservations)
            .FirstOrDefaultAsync(e => e.Id == id && e.IsActive);

        if (equipment == null) return null;

        equipment.Name = dto.Name;
        equipment.CategoryId = dto.CategoryId;
        equipment.AssetTag = dto.AssetTag.Trim().ToUpper();
        equipment.ModelNumber = dto.ModelNumber;
        equipment.SerialNumber = dto.SerialNumber;
        equipment.Description = dto.Description;
        equipment.Specifications = dto.Specifications;
        equipment.ImageUrl = dto.ImageUrl;
        equipment.Location = dto.Location;
        equipment.Status = dto.Status;
        equipment.TotalQuantity = dto.TotalQuantity;
        equipment.MaxBorrowDays = dto.MaxBorrowDays;
        equipment.TermsAndConditions = dto.TermsAndConditions;
        equipment.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var category = await _db.Categories.FindAsync(dto.CategoryId);
        equipment.Category = category;

        return MapToDto(equipment);
    }

    public async Task<bool> DeleteEquipmentAsync(Guid id)
    {
        var equipment = await _db.Equipment.FirstOrDefaultAsync(e => e.Id == id);
        if (equipment == null) return false;

        // Soft delete
        equipment.IsActive = false;
        equipment.UpdatedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();
        return true;
    }

    public async Task<List<CategoryDto>> GetCategoriesAsync()
    {
        var categories = await _db.Categories
            .Include(c => c.EquipmentList)
            .OrderBy(c => c.DisplayOrder)
            .ThenBy(c => c.Name)
            .ToListAsync();

        return categories.Select(c => new CategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            Description = c.Description,
            IconName = c.IconName,
            DisplayOrder = c.DisplayOrder,
            ItemCount = c.EquipmentList.Count(e => e.IsActive)
        }).ToList();
    }

    public async Task<CategoryDto> CreateCategoryAsync(CategoryCreateDto dto)
    {
        var category = new Category
        {
            Name = dto.Name,
            Description = dto.Description,
            IconName = dto.IconName,
            DisplayOrder = dto.DisplayOrder,
            CreatedAt = DateTime.UtcNow
        };

        _db.Categories.Add(category);
        await _db.SaveChangesAsync();

        return new CategoryDto
        {
            Id = category.Id,
            Name = category.Name,
            Description = category.Description,
            IconName = category.IconName,
            DisplayOrder = category.DisplayOrder,
            ItemCount = 0
        };
    }

    private static EquipmentResponseDto MapToDto(Equipment e)
    {
        var activeResCount = e.Reservations?.Count(r => 
            r.Status == ReservationStatus.Approved || 
            r.Status == ReservationStatus.CheckedOut) ?? 0;

        var availableQty = Math.Max(0, e.TotalQuantity - activeResCount);

        return new EquipmentResponseDto
        {
            Id = e.Id,
            Name = e.Name,
            CategoryId = e.CategoryId,
            CategoryName = e.Category?.Name ?? "Uncategorized",
            CategoryIcon = e.Category?.IconName ?? "Laptop",
            AssetTag = e.AssetTag,
            ModelNumber = e.ModelNumber,
            SerialNumber = e.SerialNumber,
            Description = e.Description,
            Specifications = e.Specifications,
            ImageUrl = e.ImageUrl,
            Location = e.Location,
            Status = e.Status.ToString(),
            TotalQuantity = e.TotalQuantity,
            AvailableQuantity = availableQty,
            MaxBorrowDays = e.MaxBorrowDays,
            TermsAndConditions = e.TermsAndConditions,
            IsActive = e.IsActive,
            CreatedAt = e.CreatedAt,
            UpdatedAt = e.UpdatedAt,
            ActiveReservationCount = activeResCount
        };
    }
}
