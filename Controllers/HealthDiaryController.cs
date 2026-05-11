using DoctorAPI.Data;
using DoctorAPI.DTOs.HealthDiary;
using DoctorAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace DoctorAPI.Controllers
{
    [ApiController]
    [Route("api/health-diary")]
    [Authorize]
    public class HealthDiaryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public HealthDiaryController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> CreateEntry([FromBody] CreateHealthDiaryEntryDto dto)
        {
            var userId = GetCurrentUserId();

            var entry = new HealthDiaryEntry
            {
                UserId = userId,
                EntryDate = DateTime.SpecifyKind(dto.EntryDate, DateTimeKind.Utc),
                WeightKg = dto.WeightKg,
                SystolicPressure = dto.SystolicPressure,
                DiastolicPressure = dto.DiastolicPressure,
                BloodSugar = dto.BloodSugar,
                SleepHours = dto.SleepHours,
                Symptoms = dto.Symptoms,
                Mood = dto.Mood,
                TookMedication = dto.TookMedication,
                MedicationNotes = dto.MedicationNotes,
                Comment = dto.Comment,
                CreatedAt = DateTime.UtcNow
            };

            _context.HealthDiaryEntries.Add(entry);
            await _context.SaveChangesAsync();

            return Ok(MapToResponse(entry));
        }

        [HttpGet("my")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> GetMyEntries(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            var userId = GetCurrentUserId();

            var query = _context.HealthDiaryEntries
                .Where(x => x.UserId == userId);

            if (from.HasValue)
                query = query.Where(x => x.EntryDate >= from.Value);

            if (to.HasValue)
                query = query.Where(x => x.EntryDate <= to.Value);

            var entries = await query
                .OrderByDescending(x => x.EntryDate)
                .Select(x => MapToResponse(x))
                .ToListAsync();

            return Ok(entries);
        }

        [HttpGet("my/{id}")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> GetMyEntryById(long id)
        {
            var userId = GetCurrentUserId();

            var entry = await _context.HealthDiaryEntries
                .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

            if (entry == null)
                return NotFound(new { message = "Health diary entry not found." });

            return Ok(MapToResponse(entry));
        }

        [HttpPut("my/{id}")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> UpdateMyEntry(long id, [FromBody] UpdateHealthDiaryEntryDto dto)
        {
            var userId = GetCurrentUserId();

            var entry = await _context.HealthDiaryEntries
                .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

            if (entry == null)
                return NotFound(new { message = "Health diary entry not found." });

            if (dto.EntryDate.HasValue)
                entry.EntryDate = DateTime.SpecifyKind(dto.EntryDate.Value, DateTimeKind.Utc);

            entry.WeightKg = dto.WeightKg;
            entry.SystolicPressure = dto.SystolicPressure;
            entry.DiastolicPressure = dto.DiastolicPressure;
            entry.BloodSugar = dto.BloodSugar;
            entry.SleepHours = dto.SleepHours;
            entry.Symptoms = dto.Symptoms;
            entry.Mood = dto.Mood;
            entry.TookMedication = dto.TookMedication;
            entry.MedicationNotes = dto.MedicationNotes;
            entry.Comment = dto.Comment;
            entry.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return Ok(MapToResponse(entry));
        }

        [HttpDelete("my/{id}")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> DeleteMyEntry(long id)
        {
            var userId = GetCurrentUserId();

            var entry = await _context.HealthDiaryEntries
                .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

            if (entry == null)
                return NotFound(new { message = "Health diary entry not found." });

            _context.HealthDiaryEntries.Remove(entry);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Health diary entry deleted successfully." });
        }

        [HttpGet("my/summary")]
        [Authorize(Roles = "User")]
        public async Task<IActionResult> GetMySummary(
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            var userId = GetCurrentUserId();

            var summary = await GenerateSimpleSummary(userId, from, to);

            return Ok(summary);
        }

        [HttpGet("admin/user/{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUserEntriesForAdmin(
            long userId,
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            var query = _context.HealthDiaryEntries
                .Where(x => x.UserId == userId);

            if (from.HasValue)
                query = query.Where(x => x.EntryDate >= from.Value);

            if (to.HasValue)
                query = query.Where(x => x.EntryDate <= to.Value);

            var entries = await query
                .OrderByDescending(x => x.EntryDate)
                .Select(x => MapToResponse(x))
                .ToListAsync();

            return Ok(entries);
        }

        [HttpGet("admin/user/{userId}/summary")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUserSummaryForAdmin(
            long userId,
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            var summary = await GenerateSimpleSummary(userId, from, to);

            return Ok(summary);
        }

        [HttpPost("admin/user/{userId}/ai-summary")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GenerateAiSummaryForAdmin(
            long userId,
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to)
        {
            var entriesQuery = _context.HealthDiaryEntries
                .Where(x => x.UserId == userId);

            if (from.HasValue)
                entriesQuery = entriesQuery.Where(x => x.EntryDate >= from.Value);

            if (to.HasValue)
                entriesQuery = entriesQuery.Where(x => x.EntryDate <= to.Value);

            var entries = await entriesQuery
                .OrderBy(x => x.EntryDate)
                .ToListAsync();

            if (!entries.Any())
                return BadRequest(new { message = "No health diary entries found for this period." });

            var periodStart = entries.Min(x => x.EntryDate);
            var periodEnd = entries.Max(x => x.EntryDate);

            // Temporary mock AI summary.
            // Later this logic can be replaced with OpenAI or Claude API.
            var summaryText =
                $"Patient has {entries.Count} health diary entries from {periodStart:yyyy-MM-dd} to {periodEnd:yyyy-MM-dd}. " +
                $"The summary is generated for doctor review only.";

            var observations = GenerateMockObservations(entries);
            var attentionPoints = GenerateMockDoctorAttentionPoints(entries);

            var aiSummary = new HealthDiaryAiSummary
            {
                UserId = userId,
                PeriodStart = periodStart,
                PeriodEnd = periodEnd,
                SummaryText = summaryText,
                Observations = observations,
                DoctorAttentionPoints = attentionPoints,
                AiProvider = "Mock",
                CreatedAt = DateTime.UtcNow
            };

            _context.HealthDiaryAiSummaries.Add(aiSummary);
            await _context.SaveChangesAsync();

            return Ok(MapToAiSummaryResponse(aiSummary));
        }

        [HttpGet("admin/user/{userId}/ai-summaries")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAiSummariesForAdmin(long userId)
        {
            var summaries = await _context.HealthDiaryAiSummaries
                .Where(x => x.UserId == userId)
                .OrderByDescending(x => x.CreatedAt)
                .Select(x => MapToAiSummaryResponse(x))
                .ToListAsync();

            return Ok(summaries);
        }

        private long GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst("userId")?.Value
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User.FindFirst("id")?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
            {
                throw new UnauthorizedAccessException("User ID not found in token.");
            }

            return long.Parse(userIdClaim);
        }

        private static HealthDiaryEntryResponseDto MapToResponse(HealthDiaryEntry entry)
        {
            return new HealthDiaryEntryResponseDto
            {
                Id = entry.Id,
                UserId = entry.UserId,
                EntryDate = entry.EntryDate,
                WeightKg = entry.WeightKg,
                SystolicPressure = entry.SystolicPressure,
                DiastolicPressure = entry.DiastolicPressure,
                BloodSugar = entry.BloodSugar,
                SleepHours = entry.SleepHours,
                Symptoms = entry.Symptoms,
                Mood = entry.Mood,
                TookMedication = entry.TookMedication,
                MedicationNotes = entry.MedicationNotes,
                Comment = entry.Comment,
                CreatedAt = entry.CreatedAt,
                UpdatedAt = entry.UpdatedAt
            };
        }

        private static HealthDiaryAiSummaryResponseDto MapToAiSummaryResponse(HealthDiaryAiSummary summary)
        {
            return new HealthDiaryAiSummaryResponseDto
            {
                Id = summary.Id,
                UserId = summary.UserId,
                PeriodStart = summary.PeriodStart,
                PeriodEnd = summary.PeriodEnd,
                SummaryText = summary.SummaryText,
                Observations = summary.Observations,
                DoctorAttentionPoints = summary.DoctorAttentionPoints,
                Disclaimer = summary.Disclaimer,
                AiProvider = summary.AiProvider,
                CreatedAt = summary.CreatedAt
            };
        }

        private static decimal? AverageOrNull(IEnumerable<decimal?> values)
        {
            var list = values.Where(x => x.HasValue).Select(x => x!.Value).ToList();

            if (!list.Any())
                return null;

            return Math.Round(list.Average(), 2);
        }

        private async Task<HealthDiarySummaryDto> GenerateSimpleSummary(
            long userId,
            DateTime? from,
            DateTime? to)
        {
            var query = _context.HealthDiaryEntries
                .Where(x => x.UserId == userId);

            if (from.HasValue)
                query = query.Where(x => x.EntryDate >= from.Value);

            if (to.HasValue)
                query = query.Where(x => x.EntryDate <= to.Value);

            var entries = await query.ToListAsync();

            if (!entries.Any())
            {
                return new HealthDiarySummaryDto
                {
                    UserId = userId,
                    TotalEntries = 0
                };
            }

            var symptoms = entries
                .Where(x => !string.IsNullOrWhiteSpace(x.Symptoms))
                .SelectMany(x => x.Symptoms!
                    .Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
                .GroupBy(x => x.ToLower())
                .OrderByDescending(g => g.Count())
                .Take(5)
                .Select(g => g.Key)
                .ToList();

            return new HealthDiarySummaryDto
            {
                UserId = userId,
                PeriodStart = entries.Min(x => x.EntryDate),
                PeriodEnd = entries.Max(x => x.EntryDate),
                TotalEntries = entries.Count,

                AverageWeightKg = AverageOrNull(entries.Select(x => x.WeightKg)),
                AverageBloodSugar = AverageOrNull(entries.Select(x => x.BloodSugar)),
                AverageSleepHours = AverageOrNull(entries.Select(x => (decimal?)x.SleepHours)),

                MedicationTakenCount = entries.Count(x => x.TookMedication == true),
                MedicationMissedCount = entries.Count(x => x.TookMedication == false),

                CommonSymptoms = symptoms
            };
        }

        private static string GenerateMockObservations(List<HealthDiaryEntry> entries)
        {
            var observations = new List<string>();

            var missedMedicationCount = entries.Count(x => x.TookMedication == false);
            if (missedMedicationCount > 0)
            {
                observations.Add($"Medication was missed {missedMedicationCount} time(s) during the selected period.");
            }

            var fatigueCount = entries.Count(x =>
                !string.IsNullOrWhiteSpace(x.Symptoms) &&
                x.Symptoms.ToLower().Contains("fatigue"));

            if (fatigueCount > 0)
            {
                observations.Add($"Fatigue was mentioned {fatigueCount} time(s).");
            }

            var lowSleepCount = entries.Count(x => x.SleepHours.HasValue && x.SleepHours.Value < 6);
            if (lowSleepCount > 0)
            {
                observations.Add($"Sleep duration was below 6 hours on {lowSleepCount} day(s).");
            }

            if (!observations.Any())
            {
                observations.Add("No significant repeated patterns were detected in the selected period.");
            }

            return string.Join(" ", observations);
        }

        private static string GenerateMockDoctorAttentionPoints(List<HealthDiaryEntry> entries)
        {
            var points = new List<string>();

            if (entries.Any(x => x.BloodSugar.HasValue))
            {
                points.Add("Review blood sugar dynamics.");
            }

            if (entries.Any(x => x.TookMedication == false))
            {
                points.Add("Discuss medication adherence with the patient.");
            }

            if (entries.Any(x => !string.IsNullOrWhiteSpace(x.Symptoms)))
            {
                points.Add("Review repeated symptoms reported by the patient.");
            }

            if (!points.Any())
            {
                points.Add("Review general patient-entered diary data.");
            }

            return string.Join(" ", points);
        }
    }
}