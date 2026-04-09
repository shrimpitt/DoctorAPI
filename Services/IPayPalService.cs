namespace DoctorAPI.Services
{
    public interface IPayPalService
    {
        Task<string> GetAccessTokenAsync();
        Task<(string OrderId, string Status)> CreateOrderAsync(decimal amount, string currency = "USD");
        Task<(bool Success, string Status, string? CaptureId, string RawResponse)> CaptureOrderAsync(string payPalOrderId);
    }
}
