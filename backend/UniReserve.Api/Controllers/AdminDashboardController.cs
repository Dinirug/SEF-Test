using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UniReserve.Api.Data;
using UniReserve.Api.DTOs;
using UniReserve.Api.Models;

namespace UniReserve.Api.Controllers;

[ApiController]
[Route("api/admin/dashboard")]
[Authorize(Roles = "Administrator")]
public class AdminDashboardController : ControllerBase
{
    private readonly ApplicationDbContext _db;

    public AdminDashboardController(ApplicationDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<DashboardStatsDto>> GetDashboardStats()
    {
        var totalEquipment = await _db.Equipment.CountAsync(e => e.IsActive);
        var maintenanceEquipment = await _db.Equipment.CountAsync(e => e.IsActive && e.Status == EquipmentStatus.Maintenance);
        var activeLoans = await _db.Reservations.CountAsync(r => r.Status == ReservationStatus.CheckedOut);
        var pendingRequests = await _db.Reservations.CountAsync(r => r.Status == ReservationStatus.Pending);
        var totalStudents = await _db.Users.CountAsync(u => u.Role == UserRole.Student);

        var totalEquipmentUnits = await _db.Equipment.Where(e => e.IsActive).SumAsync(e => (int?)e.TotalQuantity) ?? 0;
        var currentlyInUseUnits = await _db.Reservations
            .Where(r => r.Status == ReservationStatus.CheckedOut || r.Status == ReservationStatus.Approved)
            .SumAsync(r => (int?)r.Quantity) ?? 0;

        var utilizationRate = totalEquipmentUnits > 0
            ? Math.Round(((double)currentlyInUseUnits / totalEquipmentUnits) * 100, 1)
            : 0;

        var availableEquipment = Math.Max(0, totalEquipmentUnits - currentlyInUseUnits);

        // Category distribution
        var categories = await _db.Categories
            .Include(c => c.EquipmentList)
            .ToListAsync();

        var categoryDistribution = categories.Select(c =>
        {
            var count = c.EquipmentList.Count(e => e.IsActive);
            var pct = totalEquipment > 0 ? Math.Round(((double)count / totalEquipment) * 100, 1) : 0;
            return new CategoryDistributionDto
            {
                CategoryName = c.Name,
                Count = count,
                Percentage = pct
            };
        }).ToList();

        // Recent activity logs
        var recentLogs = await _db.AuditLogs
            .Include(a => a.User)
            .OrderByDescending(a => a.CreatedAt)
            .Take(10)
            .ToListAsync();

        var recentActivities = recentLogs.Select(a => new RecentActivityDto
        {
            Id = a.Id,
            Title = a.Action.Replace("_", " "),
            Description = a.Details ?? string.Empty,
            Type = a.Action,
            Timestamp = a.CreatedAt,
            UserName = a.User?.FullName ?? "System"
        }).ToList();

        // Pending approvals list
        var pendingReservations = await _db.Reservations
            .Include(r => r.User)
            .Include(r => r.Equipment)
                .ThenInclude(e => e!.Category)
            .Where(r => r.Status == ReservationStatus.Pending)
            .OrderBy(r => r.CreatedAt)
            .Take(5)
            .ToListAsync();

        var pendingApprovalsDto = pendingReservations.Select(r => new ReservationResponseDto
        {
            Id = r.Id,
            ReservationNumber = r.ReservationNumber,
            UserId = r.UserId,
            UserName = r.User?.FullName ?? "Student",
            UserEmail = r.User?.Email ?? string.Empty,
            StudentId = r.User?.StudentId,
            Department = r.User?.Department,
            EquipmentId = r.EquipmentId,
            EquipmentName = r.Equipment?.Name ?? "Item",
            EquipmentAssetTag = r.Equipment?.AssetTag ?? "N/A",
            EquipmentImageUrl = r.Equipment?.ImageUrl ?? string.Empty,
            CategoryName = r.Equipment?.Category?.Name ?? "General",
            Location = r.Equipment?.Location ?? "Tech Hub",
            StartDateTime = r.StartDateTime,
            EndDateTime = r.EndDateTime,
            Quantity = r.Quantity,
            Purpose = r.Purpose,
            Status = r.Status.ToString(),
            CreatedAt = r.CreatedAt,
            CanCancel = true
        }).ToList();

        var stats = new DashboardStatsDto
        {
            TotalEquipment = totalEquipment,
            AvailableEquipment = availableEquipment,
            ActiveLoans = activeLoans,
            PendingRequests = pendingRequests,
            MaintenanceEquipment = maintenanceEquipment,
            TotalStudents = totalStudents,
            UtilizationRate = utilizationRate,
            CategoryDistribution = categoryDistribution,
            RecentActivities = recentActivities,
            PendingApprovals = pendingApprovalsDto
        };

        return Ok(stats);
    }
}
