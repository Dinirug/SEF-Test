using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UniReserve.Api.DTOs;
using UniReserve.Api.Services;

namespace UniReserve.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EquipmentController : ControllerBase
{
    private readonly IEquipmentService _equipmentService;

    public EquipmentController(IEquipmentService equipmentService)
    {
        _equipmentService = equipmentService;
    }

    [HttpGet]
    public async Task<ActionResult<object>> GetEquipmentList([FromQuery] EquipmentQueryParameters parameters)
    {
        var (items, totalCount) = await _equipmentService.GetEquipmentListAsync(parameters);
        return Ok(new
        {
            items,
            totalCount,
            page = parameters.Page,
            pageSize = parameters.PageSize,
            totalPages = (int)Math.Ceiling((double)totalCount / parameters.PageSize)
        });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<EquipmentResponseDto>> GetEquipmentById(Guid id)
    {
        var item = await _equipmentService.GetEquipmentByIdAsync(id);
        if (item == null)
        {
            return NotFound(new { message = "Equipment not found." });
        }
        return Ok(item);
    }

    [HttpGet("categories")]
    public async Task<ActionResult<List<CategoryDto>>> GetCategories()
    {
        var categories = await _equipmentService.GetCategoriesAsync();
        return Ok(categories);
    }

    [HttpPost]
    [Authorize(Roles = "Administrator")]
    public async Task<ActionResult<EquipmentResponseDto>> CreateEquipment([FromBody] EquipmentCreateDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        try
        {
            var created = await _equipmentService.CreateEquipmentAsync(dto);
            return CreatedAtAction(nameof(GetEquipmentById), new { id = created.Id }, created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Administrator")]
    public async Task<ActionResult<EquipmentResponseDto>> UpdateEquipment(Guid id, [FromBody] EquipmentUpdateDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var updated = await _equipmentService.UpdateEquipmentAsync(id, dto);
        if (updated == null)
        {
            return NotFound(new { message = "Equipment not found." });
        }

        return Ok(updated);
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Administrator")]
    public async Task<ActionResult> DeleteEquipment(Guid id)
    {
        var success = await _equipmentService.DeleteEquipmentAsync(id);
        if (!success)
        {
            return NotFound(new { message = "Equipment not found." });
        }

        return Ok(new { message = "Equipment successfully removed." });
    }

    [HttpPost("categories")]
    [Authorize(Roles = "Administrator")]
    public async Task<ActionResult<CategoryDto>> CreateCategory([FromBody] CategoryCreateDto dto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var created = await _equipmentService.CreateCategoryAsync(dto);
        return Ok(created);
    }
}
