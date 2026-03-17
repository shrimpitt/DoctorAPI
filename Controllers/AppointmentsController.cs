using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoctorAPI.Data;
using DoctorAPI.Models;
using DoctorAPI.DTOs;

namespace DoctorAPI.Controllers
{
    [Route("api/appointments")]
    [ApiController]
    public class AppointmentsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AppointmentsController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [HttpPost]
        public async Task<ActionResult> CreateAppointment([FromBody] CreateAppointmentDto dto)
        {
            var slot = await _context.DoctorScheduleSlots
                .FirstOrDefaultAsync(s => s.Id == dto.ScheduleSlotId);

            if (slot == null)
            {
                return NotFound(new { message = "Слот не найден" });
            }

            if (slot.ConsultationTypeId != dto.ConsultationTypeId)
            {
                return BadRequest(new { message = "Выбранный слот не соответствует типу консультации" });
            }

            if (!slot.IsAvailable)
            {
                return BadRequest(new { message = "Слот уже занят" });
            }

            var existingAppointment = await _context.Appointments
                .AnyAsync(a =>
                    a.ScheduleSlotId == dto.ScheduleSlotId &&
                    (a.Status == "pending" || a.Status == "confirmed"));

            if (existingAppointment)
            {
                return BadRequest(new { message = "На этот слот уже существует активная запись" });
            }

            var appointment = new Appointment
            {
                ConsultationTypeId = dto.ConsultationTypeId,
                ScheduleSlotId = dto.ScheduleSlotId,
                FullName = dto.FullName,
                Phone = dto.Phone,
                Email = dto.Email,
                Comment = dto.Comment,
                Status = "pending",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Appointments.Add(appointment);
            await _context.SaveChangesAsync();

            slot.IsAvailable = false;
            slot.ReservedByAppointmentId = appointment.Id;
            slot.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetAppointmentById), new { id = appointment.Id }, new
            {
                message = "Запись успешно создана",
                appointmentId = appointment.Id
            });
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult> GetAppointments(
            [FromQuery] string? status,
            [FromQuery] string? search,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10)
        {
            if (page < 1)
                page = 1;

            if (pageSize < 1)
                pageSize = 10;

            if (pageSize > 100)
                pageSize = 100;

            var query = _context.Appointments.AsQueryable();

            if (!string.IsNullOrWhiteSpace(status))
            {
                var normalizedStatus = status.Trim().ToLower();
                query = query.Where(a => a.Status.ToLower() == normalizedStatus);
            }

            if (!string.IsNullOrWhiteSpace(search))
            {
                var normalizedSearch = search.Trim().ToLower();

                query = query.Where(a =>
                    a.FullName.ToLower().Contains(normalizedSearch) ||
                    a.Phone.ToLower().Contains(normalizedSearch) ||
                    (a.Email != null && a.Email.ToLower().Contains(normalizedSearch))
                );
            }

            var totalCount = await query.CountAsync();

            var appointments = await query
                .OrderByDescending(a => a.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            return Ok(new
            {
                page,
                pageSize,
                totalCount,
                totalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
                items = appointments
            });
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Appointment>> GetAppointmentById(long id)
        {
            var appointment = await _context.Appointments.FindAsync(id);

            if (appointment == null)
            {
                return NotFound(new { message = "Запись не найдена" });
            }

            return Ok(appointment);
        }

        [HttpPatch("{id}/status")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult> UpdateAppointmentStatus(long id, [FromBody] UpdateAppointmentStatusDto dto)
        {
            var appointment = await _context.Appointments.FindAsync(id);

            if (appointment == null)
            {
                return NotFound(new { message = "Запись не найдена" });
            }

            var newStatus = dto.Status.ToLower();
            var oldStatus = appointment.Status?.ToLower();

            var slot = await _context.DoctorScheduleSlots
                .FirstOrDefaultAsync(s => s.Id == appointment.ScheduleSlotId);

            appointment.Status = newStatus;
            appointment.UpdatedAt = DateTime.UtcNow;

            if (slot != null)
            {
                if (newStatus == "cancelled")
                {
                    slot.IsAvailable = true;
                    slot.ReservedByAppointmentId = null;
                    slot.UpdatedAt = DateTime.UtcNow;
                }
                else if (oldStatus == "cancelled")
                {
                    if (!slot.IsAvailable && slot.ReservedByAppointmentId != appointment.Id)
                    {
                        return BadRequest(new { message = "Слот уже занят другой записью" });
                    }

                    slot.IsAvailable = false;
                    slot.ReservedByAppointmentId = appointment.Id;
                    slot.UpdatedAt = DateTime.UtcNow;
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Статус записи обновлен",
                appointmentId = appointment.Id,
                status = appointment.Status
            });
        }
    }
}