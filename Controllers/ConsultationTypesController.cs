using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoctorAPI.Data;
using DoctorAPI.Models;

namespace DoctorAPI.Controllers
{
    [Route("api/consultation-types")]
    [ApiController]
    public class ConsultationTypesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ConsultationTypesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ConsultationType>>> GetConsultationTypes()
        {
            var consultationTypes = await _context.ConsultationTypes
                .Where(c => c.IsActive)
                .OrderBy(c => c.Id)
                .ToListAsync();

            return Ok(consultationTypes);
        }
    }
}