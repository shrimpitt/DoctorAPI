using System;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace DoctorAPI.Services
{
    public class WhatsAppNotifier : IWhatsAppNotifier
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly ILogger<WhatsAppNotifier> _logger;

        public WhatsAppNotifier(
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            ILogger<WhatsAppNotifier> _logger)
        {
            this._httpClientFactory = httpClientFactory;
            this._configuration = configuration;
            this._logger = _logger;
        }

        public async Task SendNotificationAsync(string message)
        {
            try
            {
                var enabled = _configuration.GetValue<bool>("WhatsApp:Enabled");
                var phone = _configuration["WhatsApp:Phone"];
                var apiKey = _configuration["WhatsApp:ApiKey"];

                if (!enabled)
                {
                    _logger.LogWarning("WhatsApp notification is disabled (WhatsApp:Enabled is false).");
                    return;
                }

                if (string.IsNullOrWhiteSpace(phone) || string.IsNullOrWhiteSpace(apiKey) || apiKey == "PUT_API_KEY_HERE")
                {
                    _logger.LogWarning("WhatsApp notification is misconfigured. Phone or ApiKey is missing/not set. Phone: '{Phone}', ApiKey: '{ApiKey}'", phone, apiKey);
                    return;
                }

                var urlEncodedText = Uri.EscapeDataString(message);
                var url = $"https://api.callmebot.com/whatsapp.php?phone={phone.Trim()}&text={urlEncodedText}&apikey={apiKey.Trim()}";

                var client = _httpClientFactory.CreateClient();
                _logger.LogInformation("Sending WhatsApp notification to {Phone}...", phone);

                var response = await client.GetAsync(url);
                if (!response.IsSuccessStatusCode)
                {
                    var responseContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError("Failed to send WhatsApp notification. Status code: {StatusCode}, Content: {Content}", response.StatusCode, responseContent);
                }
                else
                {
                    _logger.LogInformation("WhatsApp notification sent successfully.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An error occurred while sending WhatsApp notification via CallMeBot.");
            }
        }
    }
}
