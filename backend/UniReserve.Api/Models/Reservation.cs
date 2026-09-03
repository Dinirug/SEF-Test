using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniReserve.Api.Models;

public enum ReservationStatus
{
    Pending = 0,
    Approved = 1,
    CheckedOut = 2,
    Returned = 3,
    Cancelled = 4,
    Rejected = 5
}

[Table("reservations")]
public class Reservation
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(30)]
    [Column("reservation_number")]
    public string ReservationNumber { get; set; } = string.Empty;

    [Required]
    [Column("user_id")]
    public Guid UserId { get; set; }

    [ForeignKey("UserId")]
    public User? User { get; set; }

    [Required]
    [Column("equipment_id")]
    public Guid EquipmentId { get; set; }

    [ForeignKey("EquipmentId")]
    public Equipment? Equipment { get; set; }

    [Required]
    [Column("start_datetime")]
    public DateTime StartDateTime { get; set; }

    [Required]
    [Column("end_datetime")]
    public DateTime EndDateTime { get; set; }

    [Column("quantity")]
    public int Quantity { get; set; } = 1;

    [Required]
    [MaxLength(500)]
    [Column("purpose")]
    public string Purpose { get; set; } = string.Empty;

    [MaxLength(1000)]
    [Column("notes")]
    public string? Notes { get; set; }

    [Column("status")]
    public ReservationStatus Status { get; set; } = ReservationStatus.Pending;

    [MaxLength(500)]
    [Column("rejection_reason")]
    public string? RejectionReason { get; set; }

    [MaxLength(1000)]
    [Column("admin_notes")]
    public string? AdminNotes { get; set; }

    [MaxLength(500)]
    [Column("return_condition_notes")]
    public string? ReturnConditionNotes { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("approved_at")]
    public DateTime? ApprovedAt { get; set; }

    [Column("checked_out_at")]
    public DateTime? CheckedOutAt { get; set; }

    [Column("returned_at")]
    public DateTime? ReturnedAt { get; set; }

    [Column("cancelled_at")]
    public DateTime? CancelledAt { get; set; }
}
