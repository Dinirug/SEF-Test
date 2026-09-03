using System.ComponentModel.DataAnnotations;
using UniReserve.Api.Models;

namespace UniReserve.Api.DTOs;

public class CreateReservationDto
{
    [Required]
    public Guid EquipmentId { get; set; }

    [Required]
    public DateTime StartDateTime { get; set; }

    [Required]
    public DateTime EndDateTime { get; set; }

    [Range(1, 10)]
    public int Quantity { get; set; } = 1;

    [Required]
    [MaxLength(500)]
    public string Purpose { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Notes { get; set; }
}

public class UpdateReservationStatusDto
{
    [Required]
    public ReservationStatus Status { get; set; }

    [MaxLength(500)]
    public string? RejectionReason { get; set; }

    [MaxLength(1000)]
    public string? AdminNotes { get; set; }

    [MaxLength(500)]
    public string? ReturnConditionNotes { get; set; }
}

public class CancelReservationDto
{
    [MaxLength(500)]
    public string? Reason { get; set; }
}

public class ReservationResponseDto
{
    public Guid Id { get; set; }
    public string ReservationNumber { get; set; } = string.Empty;
    public Guid UserId { get; set; }
    public string UserName { get; set; } = string.Empty;
    public string UserEmail { get; set; } = string.Empty;
    public string? StudentId { get; set; }
    public string? Department { get; set; }
    public string? PhoneNumber { get; set; }
    
    public Guid EquipmentId { get; set; }
    public string EquipmentName { get; set; } = string.Empty;
    public string EquipmentAssetTag { get; set; } = string.Empty;
    public string EquipmentImageUrl { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;

    public DateTime StartDateTime { get; set; }
    public DateTime EndDateTime { get; set; }
    public int Quantity { get; set; }
    public string Purpose { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? RejectionReason { get; set; }
    public string? AdminNotes { get; set; }
    public string? ReturnConditionNotes { get; set; }

    public DateTime CreatedAt { get; set; }
    public DateTime? ApprovedAt { get; set; }
    public DateTime? CheckedOutAt { get; set; }
    public DateTime? ReturnedAt { get; set; }
    public DateTime? CancelledAt { get; set; }
    public bool CanCancel { get; set; }
}

public class ReservationQueryParameters
{
    public ReservationStatus? Status { get; set; }
    public Guid? UserId { get; set; }
    public Guid? EquipmentId { get; set; }
    public string? Search { get; set; }
    public DateTime? FromDate { get; set; }
    public DateTime? ToDate { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}

public class AvailabilityCheckRequestDto
{
    [Required]
    public Guid EquipmentId { get; set; }
    [Required]
    public DateTime StartDateTime { get; set; }
    [Required]
    public DateTime EndDateTime { get; set; }
}

public class AvailabilityResultDto
{
    public bool IsAvailable { get; set; }
    public int TotalQuantity { get; set; }
    public int ConflictingReservationsCount { get; set; }
    public int RemainingAvailable { get; set; }
    public string? Message { get; set; }
}
