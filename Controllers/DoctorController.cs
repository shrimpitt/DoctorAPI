using DoctorAPI.Data;
using DoctorAPI.DTOs;
using DoctorAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
        [AllowAnonymous]
        public async Task<ActionResult<DoctorProfile>> GetDoctorProfile()
        {
            var profile = await _context.DoctorProfiles.FirstOrDefaultAsync();

            if (profile == null)
                return NotFound(new { message = "Профиль врача не найден" });

            return Ok(profile);
        }

        [HttpGet("doctor-education")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<DoctorEducation>>> GetDoctorEducation()
        {
            var education = await _context.DoctorEducations
                .OrderBy(e => e.SortOrder)
                .ToListAsync();

            return Ok(education);
        }

        [HttpGet("doctor-certificates")]
        [AllowAnonymous]
        public async Task<ActionResult<IEnumerable<DoctorCertificate>>> GetDoctorCertificates()
        {
            var certificates = await _context.DoctorCertificates
                .OrderBy(c => c.SortOrder)
                .ToListAsync();

            return Ok(certificates);
        }

        [HttpPut("doctor-profile")]
        [Authorize]
        public async Task<IActionResult> UpdateDoctorProfile(UpdateDoctorProfileDto dto)
        {
            var profile = await _context.DoctorProfiles.FirstOrDefaultAsync();

            if (profile == null)
            {
                return NotFound(new { message = "Doctor profile not found" });
            }

            profile.FullName = dto.FullName;
            profile.Title = dto.Title;
            profile.ShortBio = dto.ShortBio;
            profile.FullBio = dto.FullBio;
            profile.ExperienceYears = dto.ExperienceYears;
            profile.MainPhotoUrl = dto.MainPhotoUrl;
            profile.WhatsappPhone = dto.WhatsappPhone;
            profile.Email = dto.Email;
            profile.InstagramUrl = dto.InstagramUrl;
            profile.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(profile);
        }

        [HttpPost("doctor-education")]
        [Authorize]
        public async Task<IActionResult> CreateDoctorEducation(CreateDoctorEducationDto dto)
        {
            var profileExists = await _context.DoctorProfiles
                .AnyAsync(x => x.Id == dto.DoctorProfileId);

            if (!profileExists)
            {
                return BadRequest(new { message = "Doctor profile not found" });
            }

            var education = new DoctorEducation
            {
                DoctorProfileId = dto.DoctorProfileId,
                InstitutionName = dto.InstitutionName,
                Faculty = dto.Faculty,
                Specialization = dto.Specialization,
                StartYear = dto.StartYear,
                EndYear = dto.EndYear,
                Description = dto.Description,
                SortOrder = dto.SortOrder
            };

            _context.DoctorEducations.Add(education);
            await _context.SaveChangesAsync();

            return Ok(education);
        }

        [HttpPut("doctor-education/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateDoctorEducation(long id, UpdateDoctorEducationDto dto)
        {
            var education = await _context.DoctorEducations.FindAsync(id);

            if (education == null)
            {
                return NotFound(new { message = "Doctor education not found" });
            }

            var profileExists = await _context.DoctorProfiles
                .AnyAsync(x => x.Id == dto.DoctorProfileId);

            if (!profileExists)
            {
                return BadRequest(new { message = "Doctor profile not found" });
            }

            education.DoctorProfileId = dto.DoctorProfileId;
            education.InstitutionName = dto.InstitutionName;
            education.Faculty = dto.Faculty;
            education.Specialization = dto.Specialization;
            education.StartYear = dto.StartYear;
            education.EndYear = dto.EndYear;
            education.Description = dto.Description;
            education.SortOrder = dto.SortOrder;

            await _context.SaveChangesAsync();

            return Ok(education);
        }

        [HttpDelete("doctor-education/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteDoctorEducation(long id)
        {
            var education = await _context.DoctorEducations.FindAsync(id);

            if (education == null)
            {
                return NotFound(new { message = "Doctor education not found" });
            }

            _context.DoctorEducations.Remove(education);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Doctor education deleted successfully" });
        }

        [HttpPost("doctor-certificates")]
        [Authorize]
        public async Task<IActionResult> CreateDoctorCertificate(CreateDoctorCertificateDto dto)
        {
            var profileExists = await _context.DoctorProfiles
                .AnyAsync(x => x.Id == dto.DoctorProfileId);

            if (!profileExists)
            {
                return BadRequest(new { message = "Doctor profile not found" });
            }

            var certificate = new DoctorCertificate
            {
                DoctorProfileId = dto.DoctorProfileId,
                Title = dto.Title,
                Issuer = dto.Issuer,
                IssueYear = dto.IssueYear,
                FileUrl = dto.FileUrl,
                Description = dto.Description,
                SortOrder = dto.SortOrder
            };

            _context.DoctorCertificates.Add(certificate);
            await _context.SaveChangesAsync();

            return Ok(certificate);
        }

        [HttpPut("doctor-certificates/{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateDoctorCertificate(long id, UpdateDoctorCertificateDto dto)
        {
            var certificate = await _context.DoctorCertificates.FindAsync(id);

            if (certificate == null)
            {
                return NotFound(new { message = "Doctor certificate not found" });
            }

            var profileExists = await _context.DoctorProfiles
                .AnyAsync(x => x.Id == dto.DoctorProfileId);

            if (!profileExists)
            {
                return BadRequest(new { message = "Doctor profile not found" });
            }

            certificate.DoctorProfileId = dto.DoctorProfileId;
            certificate.Title = dto.Title;
            certificate.Issuer = dto.Issuer;
            certificate.IssueYear = dto.IssueYear;
            certificate.FileUrl = dto.FileUrl;
            certificate.Description = dto.Description;
            certificate.SortOrder = dto.SortOrder;

            await _context.SaveChangesAsync();

            return Ok(certificate);
        }

        [HttpDelete("doctor-certificates/{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteDoctorCertificate(long id)
        {
            var certificate = await _context.DoctorCertificates.FindAsync(id);

            if (certificate == null)
            {
                return NotFound(new { message = "Doctor certificate not found" });
            }

            _context.DoctorCertificates.Remove(certificate);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Doctor certificate deleted successfully" });
        }
    }
}