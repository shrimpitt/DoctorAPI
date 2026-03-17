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

        [HttpPost]
        [HttpPost]
        public async Task<ActionResult<DoctorScheduleSlot>> CreateSlot(CreateDoctorScheduleSlotDto dto)
        {
            if (dto.StartTime >= dto.EndTime)
            {
                return BadRequest(new { message = "StartTime must be less than EndTime" });
            }

            var consultationTypeExists = await _context.ConsultationTypes
                .AnyAsync(c => c.Id == dto.ConsultationTypeId);

            if (!consultationTypeExists)
            {
                return BadRequest(new { message = "Consultation type not found" });
            }

            var slotDateUtc = DateTime.SpecifyKind(dto.SlotDate.Date, DateTimeKind.Utc);

            var duplicateSlot = await _context.DoctorScheduleSlots.AnyAsync(s =>
                s.ConsultationTypeId == dto.ConsultationTypeId &&
                s.SlotDate == slotDateUtc &&
                s.StartTime == dto.StartTime &&
                s.EndTime == dto.EndTime);

            if (duplicateSlot)
            {
                return BadRequest(new { message = "This slot already exists" });
            }

            var slot = new DoctorScheduleSlot
            {
                ConsultationTypeId = dto.ConsultationTypeId,
                SlotDate = slotDateUtc,
                StartTime = dto.StartTime,
                EndTime = dto.EndTime,
                IsAvailable = true,
                ReservedByAppointmentId = null,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.DoctorScheduleSlots.Add(slot);
            await _context.SaveChangesAsync();

            return Ok(slot);
        }
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSlot(long id)
        {
            var slot = await _context.DoctorScheduleSlots.FindAsync(id);

            if (slot == null)
            {
                return NotFound(new { message = "Slot not found" });
            }

            if (!slot.IsAvailable || slot.ReservedByAppointmentId != null)
            {
                return BadRequest(new { message = "Booked slot cannot be deleted" });
            }

            _context.DoctorScheduleSlots.Remove(slot);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Slot deleted successfully" });
        }
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateSlot(long id, UpdateDoctorScheduleSlotDto dto)
        {
            var slot = await _context.DoctorScheduleSlots.FindAsync(id);

            if (slot == null)
            {
                return NotFound(new { message = "Slot not found" });
            }

            if (!slot.IsAvailable || slot.ReservedByAppointmentId != null)
            {
                return BadRequest(new { message = "Booked slot cannot be updated" });
            }

            if (dto.StartTime >= dto.EndTime)
            {
                return BadRequest(new { message = "StartTime must be less than EndTime" });
            }

            var consultationTypeExists = await _context.ConsultationTypes
                .AnyAsync(c => c.Id == dto.ConsultationTypeId);

            if (!consultationTypeExists)
            {
                return BadRequest(new { message = "Consultation type not found" });
            }

            var slotDateUtc = DateTime.SpecifyKind(dto.SlotDate.Date, DateTimeKind.Utc);

            var duplicateExists = await _context.DoctorScheduleSlots.AnyAsync(s =>
                s.Id != id &&
                s.ConsultationTypeId == dto.ConsultationTypeId &&
                s.SlotDate == slotDateUtc &&
                s.StartTime == dto.StartTime &&
                s.EndTime == dto.EndTime);

            if (duplicateExists)
            {
                return BadRequest(new { message = "This slot already exists" });
            }

            slot.ConsultationTypeId = dto.ConsultationTypeId;
            slot.SlotDate = slotDateUtc;
            slot.StartTime = dto.StartTime;
            slot.EndTime = dto.EndTime;
            slot.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(slot);
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<DoctorScheduleSlot>>> GetAllSlots(
    [FromQuery] DateTime? date,
    [FromQuery] long? consultationTypeId,
    [FromQuery] bool? isAvailable)
        {
            var query = _context.DoctorScheduleSlots.AsQueryable();

            if (date.HasValue)
            {
                var filterDate = DateTime.SpecifyKind(date.Value.Date, DateTimeKind.Utc);
                query = query.Where(s => s.SlotDate == filterDate);
            }

            if (consultationTypeId.HasValue)
            {
                query = query.Where(s => s.ConsultationTypeId == consultationTypeId.Value);
            }

            if (isAvailable.HasValue)
            {
                query = query.Where(s => s.IsAvailable == isAvailable.Value);
            }

            var slots = await query
                .OrderBy(s => s.SlotDate)
                .ThenBy(s => s.StartTime)
                .ToListAsync();

            return Ok(slots);
        }
        [HttpPost("bulk")]
        public async Task<IActionResult> CreateSlotsBulk(CreateBulkDoctorScheduleSlotsDto dto)
        {
            if (dto.Slots == null || dto.Slots.Count == 0)
            {
                return BadRequest(new { message = "Slots list cannot be empty" });
            }

            var consultationTypeExists = await _context.ConsultationTypes
                .AnyAsync(c => c.Id == dto.ConsultationTypeId);

            if (!consultationTypeExists)
            {
                return BadRequest(new { message = "Consultation type not found" });
            }

            var slotDateUtc = DateTime.SpecifyKind(dto.SlotDate.Date, DateTimeKind.Utc);

            var createdSlots = new List<DoctorScheduleSlot>();

            foreach (var item in dto.Slots)
            {
                if (item.StartTime >= item.EndTime)
                {
                    return BadRequest(new { message = "StartTime must be less than EndTime" });
                }

                var duplicateExists = await _context.DoctorScheduleSlots.AnyAsync(s =>
                    s.ConsultationTypeId == dto.ConsultationTypeId &&
                    s.SlotDate == slotDateUtc &&
                    s.StartTime == item.StartTime &&
                    s.EndTime == item.EndTime);

                if (duplicateExists)
                {
                    continue;
                }

                var slot = new DoctorScheduleSlot
                {
                    ConsultationTypeId = dto.ConsultationTypeId,
                    SlotDate = slotDateUtc,
                    StartTime = item.StartTime,
                    EndTime = item.EndTime,
                    IsAvailable = true,
                    ReservedByAppointmentId = null,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                createdSlots.Add(slot);
            }

            if (createdSlots.Count == 0)
            {
                return BadRequest(new { message = "All slots already exist" });
            }

            _context.DoctorScheduleSlots.AddRange(createdSlots);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Slots created successfully",
                createdCount = createdSlots.Count,
                slots = createdSlots
            });
        }
    }
}