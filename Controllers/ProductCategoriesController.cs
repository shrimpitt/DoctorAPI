using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using DoctorAPI.Data;
using DoctorAPI.Models;

namespace DoctorAPI.Controllers
{
    [Route("api/product-categories")]
    [ApiController]
    public class ProductCategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public ProductCategoriesController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductCategory>>> GetCategories()
        {
            var categories = await _context.ProductCategories
                .Where(c => c.IsActive)
                .OrderBy(c => c.SortOrder)
                .ToListAsync();

            return Ok(categories);
        }
    }
}