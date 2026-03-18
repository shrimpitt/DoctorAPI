using DoctorAPI.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace DoctorAPI.Controllers
{
    [Route("api/dashboard")]
    [ApiController]
    [Authorize]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var totalAppointments = await _context.Appointments.CountAsync();

            var confirmedAppointments = await _context.Appointments
                .CountAsync(a => a.Status == "confirmed");

            var cancelledAppointments = await _context.Appointments
                .CountAsync(a => a.Status == "cancelled");

            var totalSlots = await _context.DoctorScheduleSlots.CountAsync();

            var availableSlots = await _context.DoctorScheduleSlots
                .CountAsync(s => s.IsAvailable);

            var bookedSlots = await _context.DoctorScheduleSlots
                .CountAsync(s => !s.IsAvailable);

            return Ok(new
            {
                totalAppointments,
                confirmedAppointments,
                cancelledAppointments,
                totalSlots,
                availableSlots,
                bookedSlots
            });
        }

        [HttpGet("appointments-per-day")]
        public async Task<IActionResult> GetAppointmentsPerDay()
        {
            var rawData = await _context.Appointments
                .GroupBy(a => a.CreatedAt.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    Count = g.Count()
                })
                .OrderBy(x => x.Date)
                .ToListAsync();

            var result = rawData
                .Select(x => new
                {
                    date = x.Date.ToString("yyyy-MM-dd"),
                    count = x.Count
                })
                .ToList();

            return Ok(result);
        }
    }
}