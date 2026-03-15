using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoctorAPI.Data;
using DoctorAPI.Models;

namespace DoctorAPI.Controllers
{
    [Route("api/doctor-schedule-slots")]
    [ApiController]
    public class DoctorScheduleSlotsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DoctorScheduleSlotsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("available")]
        public async Task<ActionResult<IEnumerable<DoctorScheduleSlot>>> GetAvailableSlots()
        {
            var slots = await _context.DoctorScheduleSlots
                .Where(s => s.IsAvailable)
                .OrderBy(s => s.SlotDate)
                .ThenBy(s => s.StartTime)
                .ToListAsync();

            return Ok(slots);
        }
    }
}