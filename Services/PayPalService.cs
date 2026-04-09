using System.Globalization;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using DoctorAPI.Options;
using Microsoft.Extensions.Options;

namespace DoctorAPI.Services
{
    public class PayPalService : IPayPalService
    {
        private readonly HttpClient _httpClient;
        private readonly PayPalOptions _options;

        public PayPalService(HttpClient httpClient, IOptions<PayPalOptions> options)
        {
            _httpClient = httpClient;
            _options = options.Value;
        }

        public async Task<string> GetAccessTokenAsync()
        {
            var auth = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_options.ClientId}:{_options.ClientSecret}"));

            using var request = new HttpRequestMessage(HttpMethod.Post, $"{_options.BaseUrl}/v1/oauth2/token");
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", auth);
            request.Content = new StringContent("grant_type=client_credentials", Encoding.UTF8, "application/x-www-form-urlencoded");

            using var response = await _httpClient.SendAsync(request);
            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                throw new Exception($"PayPal token error: {content}");

            using var json = JsonDocument.Parse(content);
            return json.RootElement.GetProperty("access_token").GetString()
                   ?? throw new Exception("PayPal access_token not found.");
        }

        public async Task<(string OrderId, string Status)> CreateOrderAsync(decimal amount, string currency = "USD")
        {
            var accessToken = await GetAccessTokenAsync();

            var payload = new
            {
                intent = "CAPTURE",
                purchase_units = new[]
                {
                    new
                    {
                        amount = new
                        {
                            currency_code = currency,
                            value = amount.ToString("0.00", CultureInfo.InvariantCulture)
                        }
                    }
                }
            };

            var jsonBody = JsonSerializer.Serialize(payload);

            using var request = new HttpRequestMessage(HttpMethod.Post, $"{_options.BaseUrl}/v2/checkout/orders");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            request.Content = new StringContent(jsonBody, Encoding.UTF8, "application/json");

            using var response = await _httpClient.SendAsync(request);
            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                throw new Exception($"PayPal create order error: {content}");

            using var json = JsonDocument.Parse(content);
            var orderId = json.RootElement.GetProperty("id").GetString() ?? string.Empty;
            var status = json.RootElement.GetProperty("status").GetString() ?? string.Empty;

            return (orderId, status);
        }

        public async Task<(bool Success, string Status, string? CaptureId, string RawResponse)> CaptureOrderAsync(string payPalOrderId)
        {
            var accessToken = await GetAccessTokenAsync();

            using var request = new HttpRequestMessage(HttpMethod.Post, $"{_options.BaseUrl}/v2/checkout/orders/{payPalOrderId}/capture");
            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            request.Content = new StringContent(string.Empty, Encoding.UTF8, "application/json");

            using var response = await _httpClient.SendAsync(request);
            var content = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                return (false, "ERROR", null, content);

            using var json = JsonDocument.Parse(content);
            var status = json.RootElement.GetProperty("status").GetString() ?? string.Empty;

            string? captureId = null;
            if (json.RootElement.TryGetProperty("purchase_units", out var purchaseUnits) &&
                purchaseUnits.GetArrayLength() > 0)
            {
                var purchaseUnit = purchaseUnits[0];
                if (purchaseUnit.TryGetProperty("payments", out var payments) &&
                    payments.TryGetProperty("captures", out var captures) &&
                    captures.GetArrayLength() > 0)
                {
                    captureId = captures[0].GetProperty("id").GetString();
                }
            }

            var success = status == "COMPLETED";
            return (success, status, captureId, content);
        }
    }
}
