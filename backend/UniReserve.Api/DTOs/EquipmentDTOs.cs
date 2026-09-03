using System.ComponentModel.DataAnnotations;
using UniReserve.Api.Models;

namespace UniReserve.Api.DTOs;

public class CategoryDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string IconName { get; set; } = "Laptop";
    public int DisplayOrder { get; set; }
    public int ItemCount { get; set; }
}

public class CategoryCreateDto
{
    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [MaxLength(500)]
    public string? Description { get; set; }

    [MaxLength(50)]
    public string IconName { get; set; } = "Laptop";

    public int DisplayOrder { get; set; } = 0;
}

public class EquipmentResponseDto
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string CategoryIcon { get; set; } = "Laptop";
    public string AssetTag { get; set; } = string.Empty;
    public string? ModelNumber { get; set; }
    public string? SerialNumber { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Specifications { get; set; } = "{}";
    public string ImageUrl { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public int TotalQuantity { get; set; }
    public int AvailableQuantity { get; set; }
    public int MaxBorrowDays { get; set; }
    public string? TermsAndConditions { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int ActiveReservationCount { get; set; }
}

public class EquipmentCreateDto
{
    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public Guid CategoryId { get; set; }

    [Required]
    [MaxLength(50)]
    public string AssetTag { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? ModelNumber { get; set; }

    [MaxLength(100)]
    public string? SerialNumber { get; set; }

    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    public string Specifications { get; set; } = "{}";

    [Required]
    [MaxLength(500)]
    public string ImageUrl { get; set; } = string.Empty;

    [MaxLength(150)]
    public string Location { get; set; } = "Main Campus Tech Hub";

    public EquipmentStatus Status { get; set; } = EquipmentStatus.Available;

    [Range(1, 100)]
    public int TotalQuantity { get; set; } = 1;

    [Range(1, 60)]
    public int MaxBorrowDays { get; set; } = 7;

    [MaxLength(1000)]
    public string? TermsAndConditions { get; set; }
}

public class EquipmentUpdateDto
{
    [Required]
    [MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    [Required]
    public Guid CategoryId { get; set; }

    [Required]
    [MaxLength(50)]
    public string AssetTag { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? ModelNumber { get; set; }

    [MaxLength(100)]
    public string? SerialNumber { get; set; }

    [Required]
    [MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    public string Specifications { get; set; } = "{}";

    [Required]
    [MaxLength(500)]
    public string ImageUrl { get; set; } = string.Empty;

    [MaxLength(150)]
    public string Location { get; set; } = "Main Campus Tech Hub";

    public EquipmentStatus Status { get; set; } = EquipmentStatus.Available;

    [Range(1, 100)]
    public int TotalQuantity { get; set; } = 1;

    [Range(1, 60)]
    public int MaxBorrowDays { get; set; } = 7;

    [MaxLength(1000)]
    public string? TermsAndConditions { get; set; }
}

public class EquipmentQueryParameters
{
    public string? Search { get; set; }
    public Guid? CategoryId { get; set; }
    public EquipmentStatus? Status { get; set; }
    public string? Location { get; set; }
    public DateTime? AvailableFrom { get; set; }
    public DateTime? AvailableTo { get; set; }
    public string? SortBy { get; set; } = "name"; // name, date, popular
    public bool SortDescending { get; set; } = false;
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
