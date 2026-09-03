using UniReserve.Api.DTOs;
using UniReserve.Api.Models;

namespace UniReserve.Api.Services;

public interface IEquipmentService
{
    Task<(List<EquipmentResponseDto> Items, int TotalCount)> GetEquipmentListAsync(EquipmentQueryParameters parameters);
    Task<EquipmentResponseDto?> GetEquipmentByIdAsync(Guid id);
    Task<EquipmentResponseDto> CreateEquipmentAsync(EquipmentCreateDto dto);
    Task<EquipmentResponseDto?> UpdateEquipmentAsync(Guid id, EquipmentUpdateDto dto);
    Task<bool> DeleteEquipmentAsync(Guid id);
    Task<List<CategoryDto>> GetCategoriesAsync();
    Task<CategoryDto> CreateCategoryAsync(CategoryCreateDto dto);
}
