using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoctorAPI.Data;
using DoctorAPI.Models;

namespace DoctorAPI.Controllers
{
    [Route("api")]
    [ApiController]
    public class DoctorController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DoctorController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("doctor-profile")]
        public async Task<ActionResult<DoctorProfile>> GetDoctorProfile()
        {
            var profile = await _context.DoctorProfiles.FirstOrDefaultAsync();

            if (profile == null)
                return NotFound(new { message = "Профиль врача не найден" });

            return Ok(profile);
        }

        [HttpGet("doctor-education")]
        public async Task<ActionResult<IEnumerable<DoctorEducation>>> GetDoctorEducation()
        {
            var education = await _context.DoctorEducations
                .OrderBy(e => e.SortOrder)
                .ToListAsync();

            return Ok(education);
        }

        [HttpGet("doctor-certificates")]
        public async Task<ActionResult<IEnumerable<DoctorCertificate>>> GetDoctorCertificates()
        {
            var certificates = await _context.DoctorCertificates
                .OrderBy(c => c.SortOrder)
                .ToListAsync();

            return Ok(certificates);
        }
    }
}