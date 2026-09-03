using UniReserve.Api.DTOs;
using UniReserve.Api.Models;

namespace UniReserve.Api.Services;

public interface IReservationService
{
    Task<(List<ReservationResponseDto> Items, int TotalCount)> GetReservationsAsync(ReservationQueryParameters parameters);
    Task<List<ReservationResponseDto>> GetUserReservationsAsync(Guid userId, ReservationStatus? status = null);
    Task<ReservationResponseDto?> GetReservationByIdAsync(Guid id);
    Task<ReservationResponseDto> CreateReservationAsync(Guid userId, CreateReservationDto dto);
    Task<ReservationResponseDto> UpdateReservationStatusAsync(Guid reservationId, UpdateReservationStatusDto dto, Guid? adminUserId = null);
    Task<ReservationResponseDto> CancelReservationAsync(Guid reservationId, Guid userId, bool isAdmin, CancelReservationDto? dto = null);
    Task<AvailabilityResultDto> CheckAvailabilityAsync(AvailabilityCheckRequestDto request);
}
