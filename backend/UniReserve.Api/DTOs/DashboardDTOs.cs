namespace UniReserve.Api.DTOs;

public class DashboardStatsDto
{
    public int TotalEquipment { get; set; }
    public int AvailableEquipment { get; set; }
    public int ActiveLoans { get; set; }
    public int PendingRequests { get; set; }
    public int MaintenanceEquipment { get; set; }
    public int TotalStudents { get; set; }
    public double UtilizationRate { get; set; }
    
    public List<CategoryDistributionDto> CategoryDistribution { get; set; } = new();
    public List<RecentActivityDto> RecentActivities { get; set; } = new();
    public List<ReservationResponseDto> PendingApprovals { get; set; } = new();
}

public class CategoryDistributionDto
{
    public string CategoryName { get; set; } = string.Empty;
    public int Count { get; set; }
    public double Percentage { get; set; }
}

public class RecentActivityDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty; // ReservationCreated, StatusChanged, EquipmentAdded
    public DateTime Timestamp { get; set; }
    public string? UserName { get; set; }
}
