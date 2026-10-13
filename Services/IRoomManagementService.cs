using BookingApp.DTOs;

namespace BookingApp.Services;

public interface IRoomManagementService
{
    Task<IEnumerable<RoomDto>> GetAllRoomsAsync();
    Task<RoomDto?> GetRoomByIdAsync(Guid id);
    Task<IEnumerable<RoomDto>> GetAvailableRoomsAsync(DateTime startTime, DateTime endTime, int minCapacity = 0);
    Task<Guid> CreateRoomAsync(CreateRoomDto createDto);
    Task<bool> UpdateRoomAsync(Guid id, UpdateRoomDto updateDto);
    Task<bool> DeleteRoomAsync(Guid id);
}
