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
        public async Task<ActionResult> CreateAppointment(CreateAppointmentDto dto)
        {
            var slot = await _context.DoctorScheduleSlots
                .FirstOrDefaultAsync(s => s.Id == dto.ScheduleSlotId);

            if (slot == null)
            {
                return NotFound(new { message = "Слот не найден" });
            }

            if (!slot.IsAvailable)
            {
                return BadRequest(new { message = "Слот уже занят" });
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

            return Ok(new
            {
                message = "Запись успешно создана",
                appointmentId = appointment.Id
            });
        }
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Appointment>>> GetAppointments()
        {
            var appointments = await _context.Appointments
                .OrderByDescending(a => a.CreatedAt)
                .ToListAsync();

            return Ok(appointments);
        }
        [HttpGet("{id}")]
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
        public async Task<ActionResult> UpdateAppointmentStatus(long id, UpdateAppointmentStatusDto dto)
        {
            var appointment = await _context.Appointments.FindAsync(id);

            if (appointment == null)
            {
                return NotFound(new { message = "Запись не найдена" });
            }

            appointment.Status = dto.Status;
            appointment.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Статус записи обновлен" });
        }
    }
}