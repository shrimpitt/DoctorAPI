using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoctorAPI.Data;
using Microsoft.AspNetCore.Authorization;

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
        [HttpPut("site-contacts")]
        [Authorize]
        public async Task<IActionResult> UpdateSiteContacts([FromBody] Dictionary<string, string> data)
        {
            foreach (var item in data)
            {
                var setting = await _context.Settings
                    .FirstOrDefaultAsync(s => s.Key == item.Key);

                if (setting != null)
                {
                    setting.Value = item.Value;
                }
                else
                {
                    _context.Settings.Add(new Models.Setting
                    {
                        Key = item.Key,
                        Value = item.Value
                    });
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = "Контакты обновлены" });
        }
    }
}