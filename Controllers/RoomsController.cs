using BookingApp.DTOs;
using BookingApp.Services;
using Microsoft.AspNetCore.Mvc;

namespace BookingApp.Controllers;

[ApiController]
[Route("api/[controller]")]
public class RoomsController : ControllerBase
{
    private readonly IRoomManagementService _roomService;

    public RoomsController(IRoomManagementService roomService)
    {
        _roomService = roomService;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<RoomDto>>> GetRooms()
    {
        var rooms = await _roomService.GetAllRoomsAsync();
        return Ok(rooms);
    }

    [HttpGet("available")]
    public async Task<ActionResult<IEnumerable<RoomDto>>> GetAvailableRooms(
        [FromQuery] DateTime startTime, 
        [FromQuery] DateTime endTime, 
        [FromQuery] int minCapacity = 0)
    {
        if (startTime >= endTime)
        {
            return BadRequest("startTime must be earlier than endTime.");
        }

        var rooms = await _roomService.GetAvailableRoomsAsync(startTime, endTime, minCapacity);
        return Ok(rooms);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<RoomDto>> GetRoom(Guid id)
    {
        var room = await _roomService.GetRoomByIdAsync(id);
        
        if (room == null)
        {
            return NotFound();
        }

        return Ok(room);
    }

    [HttpPost]
    public async Task<ActionResult> CreateRoom([FromBody] CreateRoomDto createDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var roomId = await _roomService.CreateRoomAsync(createDto);
        
        return CreatedAtAction(nameof(GetRoom), new { id = roomId }, new { id = roomId });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateRoom(Guid id, [FromBody] UpdateRoomDto updateDto)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest(ModelState);
        }

        var result = await _roomService.UpdateRoomAsync(id, updateDto);
        
        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteRoom(Guid id)
    {
        var result = await _roomService.DeleteRoomAsync(id);

        if (!result)
        {
            return NotFound();
        }

        return NoContent();
    }
}
