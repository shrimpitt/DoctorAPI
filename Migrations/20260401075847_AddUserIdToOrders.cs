using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace DoctorAPI.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdToOrders : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<long>(
                name: "user_id",
                schema: "public",
                table: "orders",
                type: "bigint",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_orders_user_id",
                schema: "public",
                table: "orders",
                column: "user_id");

            migrationBuilder.AddForeignKey(
                name: "FK_orders_users_user_id",
                schema: "public",
                table: "orders",
                column: "user_id",
                principalTable: "users",
                principalColumn: "id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_orders_users_user_id",
                schema: "public",
                table: "orders");

            migrationBuilder.DropIndex(
                name: "IX_orders_user_id",
                schema: "public",
                table: "orders");

            migrationBuilder.DropColumn(
                name: "user_id",
                schema: "public",
                table: "orders");
        }
    }
}
