using DoctorAPI.Data;
using DoctorAPI.DTOs;
using DoctorAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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

        [HttpGet("available-grouped")]
        public async Task<ActionResult<IEnumerable<AvailableSlotsByDateDto>>> GetAvailableSlotsGrouped(
    [FromQuery] long? consultationTypeId)
        {
            var query = _context.DoctorScheduleSlots
                .Where(s => s.IsAvailable);

            if (consultationTypeId.HasValue)
            {
                query = query.Where(s => s.ConsultationTypeId == consultationTypeId.Value);
            }

            var slots = await query
                .Join(
                    _context.ConsultationTypes,
                    slot => slot.ConsultationTypeId,
                    consultationType => consultationType.Id,
                    (slot, consultationType) => new
                    {
                        slot.Id,
                        ConsultationTypeId = consultationType.Id,
                        ConsultationTypeName = consultationType.Name,
                        slot.SlotDate,
                        slot.StartTime,
                        slot.EndTime
                    })
                .OrderBy(x => x.SlotDate)
                .ThenBy(x => x.StartTime)
                .ToListAsync();

            var result = slots
                .GroupBy(x => x.SlotDate.Date)
                .Select(group => new AvailableSlotsByDateDto
                {
                    Date = group.Key.ToString("yyyy-MM-dd"),
                    Slots = group.Select(x => new AvailableSlotItemDto
                    {
                        SlotId = x.Id,
                        ConsultationTypeId = x.ConsultationTypeId,
                        ConsultationTypeName = x.ConsultationTypeName,
                        StartTime = x.StartTime.ToString(@"hh\:mm"),
                        EndTime = x.EndTime.ToString(@"hh\:mm")
                    }).ToList()
                })
                .ToList();

            return Ok(result);
        }
    }
}