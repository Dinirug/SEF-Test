using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace UniReserve.Api.Models;

public enum EquipmentStatus
{
    Available = 0,
    Reserved = 1,
    Maintenance = 2,
    Retired = 3
}

[Table("equipment")]
public class Equipment
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Required]
    [MaxLength(150)]
    [Column("name")]
    public string Name { get; set; } = string.Empty;

    [Required]
    [Column("category_id")]
    public Guid CategoryId { get; set; }

    [ForeignKey("CategoryId")]
    public Category? Category { get; set; }

    [Required]
    [MaxLength(50)]
    [Column("asset_tag")]
    public string AssetTag { get; set; } = string.Empty;

    [MaxLength(100)]
    [Column("model_number")]
    public string? ModelNumber { get; set; }

    [MaxLength(100)]
    [Column("serial_number")]
    public string? SerialNumber { get; set; }

    [MaxLength(2000)]
    [Column("description")]
    public string Description { get; set; } = string.Empty;

    [Column("specifications")]
    public string Specifications { get; set; } = "{}";

    [MaxLength(500)]
    [Column("image_url")]
    public string ImageUrl { get; set; } = string.Empty;

    [MaxLength(150)]
    [Column("location")]
    public string Location { get; set; } = "Main Campus Tech Hub";

    [Column("status")]
    public EquipmentStatus Status { get; set; } = EquipmentStatus.Available;

    [Column("total_quantity")]
    public int TotalQuantity { get; set; } = 1;

    [Column("available_quantity")]
    public int AvailableQuantity { get; set; } = 1;

    [Column("max_borrow_days")]
    public int MaxBorrowDays { get; set; } = 7;

    [MaxLength(1000)]
    [Column("terms_and_conditions")]
    public string? TermsAndConditions { get; set; } = "Student ID required upon pickup. Must be returned in clean, undamaged condition with all accessories.";

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<Reservation> Reservations { get; set; } = new List<Reservation>();
}
