using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoctorAPI.Data;

namespace DoctorAPI.Controllers
{
    [Route("api")]
    [ApiController]
    public class SiteController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SiteController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("site-contacts")]
        public async Task<ActionResult> GetSiteContacts()
        {
            var settings = await _context.Settings.ToListAsync();

            string? GetValue(string key) => settings.FirstOrDefault(s => s.Key == key)?.Value;

            return Ok(new
            {
                assistantWhatsapp = GetValue("assistant_whatsapp"),
                instagramUrl = GetValue("instagram_url"),
                providerName = GetValue("provider_name"),
                providerBin = GetValue("provider_bin"),
                footerNotice = GetValue("footer_notice")
            });
        }
    }
}