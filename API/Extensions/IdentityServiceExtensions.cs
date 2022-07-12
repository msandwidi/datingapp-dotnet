using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using API.Data;
using API.Entities;
using API.Interfaces;
using API.services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace API.Extensions
{
  public static class IdentityServiceExtensions
  {
    public static IServiceCollection AddIdentityServices(this IServiceCollection services, IConfiguration config)
    {

      services.AddIdentityCore<AppUser>(opt =>
      {
        opt.Password.RequireNonAlphanumeric = false; //FIXME:
        opt.Password.RequireUppercase = false; //FIXME:
        opt.Password.RequireDigit = false; //FIXME:
      })
      .AddRoles<AppRole>()
      .AddRoleManager<RoleManager<AppRole>>()
      .AddSignInManager<SignInManager<AppUser>>()
      .AddRoleValidator<RoleValidator<AppRole>>()
      .AddEntityFrameworkStores<DataContext>();


      services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(opts =>
     {
       opts.TokenValidationParameters = new TokenValidationParameters
       {
         ValidateIssuerSigningKey = true,
         IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["TokenKey"])),
         ValidateAudience = false,
         ValidateIssuer = false
       };
     });

     services.AddAuthorization(opt=>{
      opt.AddPolicy("RequireAdminRole", policy=>policy.RequireRole("Admin"));
      opt.AddPolicy("ModeratePhotoRole", policy=>policy.RequireRole("Admin", "Moderator"));
     });

      return services;
    }
  }
}