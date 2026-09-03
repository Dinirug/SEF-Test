using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniReserve.Api.DTOs;
using UniReserve.Api.Models;
using UniReserve.Api.Services;

namespace UniReserve.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReservationsController : ControllerBase
{
    private readonly IReservationService _reservationService;

    public ReservationsController(IReservationService reservationService)
    {
        _reservationService = reservationService;
    }

    [HttpPost]
    [Authorize]
    public async Task<ActionResult<ReservationResponseDto>> CreateReservation([FromBody] CreateReservationDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        try
        {
            var created = await _reservationService.CreateReservationAsync(userId.Value, dto);
            return CreatedAtAction(nameof(GetReservationById), new { id = created.Id }, created);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("my")]
    [Authorize]
    public async Task<ActionResult<List<ReservationResponseDto>>> GetMyReservations([FromQuery] ReservationStatus? status)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        var reservations = await _reservationService.GetUserReservationsAsync(userId.Value, status);
        return Ok(reservations);
    }

    [HttpGet("{id:guid}")]
    [Authorize]
    public async Task<ActionResult<ReservationResponseDto>> GetReservationById(Guid id)
    {
        var res = await _reservationService.GetReservationByIdAsync(id);
        if (res == null)
        {
            return NotFound(new { message = "Reservation not found." });
        }

        var userId = GetCurrentUserId();
        var isAdmin = User.IsInRole("Administrator");

        if (!isAdmin && res.UserId != userId)
        {
            return Forbid();
        }

        return Ok(res);
    }

    [HttpPut("{id:guid}/cancel")]
    [Authorize]
    public async Task<ActionResult<ReservationResponseDto>> CancelReservation(Guid id, [FromBody] CancelReservationDto? dto)
    {
        var userId = GetCurrentUserId();
        if (userId == null)
        {
            return Unauthorized();
        }

        var isAdmin = User.IsInRole("Administrator");

        try
        {
            var cancelled = await _reservationService.CancelReservationAsync(id, userId.Value, isAdmin, dto);
            return Ok(cancelled);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet]
    [Authorize(Roles = "Administrator")]
    public async Task<ActionResult<object>> GetAllReservations([FromQuery] ReservationQueryParameters parameters)
    {
        var (items, totalCount) = await _reservationService.GetReservationsAsync(parameters);
        return Ok(new
        {
            items,
            totalCount,
            page = parameters.Page,
            pageSize = parameters.PageSize,
            totalPages = (int)Math.Ceiling((double)totalCount / parameters.PageSize)
        });
    }

    [HttpPut("{id:guid}/status")]
    [Authorize(Roles = "Administrator")]
    public async Task<ActionResult<ReservationResponseDto>> UpdateStatus(Guid id, [FromBody] UpdateReservationStatusDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var adminId = GetCurrentUserId();

        try
        {
            var updated = await _reservationService.UpdateReservationStatusAsync(id, dto, adminId);
            return Ok(updated);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPost("check-availability")]
    public async Task<ActionResult<AvailabilityResultDto>> CheckAvailability([FromBody] AvailabilityCheckRequestDto request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _reservationService.CheckAvailabilityAsync(request);
        return Ok(result);
    }

    private Guid? GetCurrentUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (Guid.TryParse(claim, out var guid))
        {
            return guid;
        }
        return null;
    }
}
