using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
  public class BuggyController : BaseApiController
  {
    private DataContext _context { get; set; }

    public BuggyController(DataContext context)
    {
      _context = context;
    }

    [Authorize]
    [HttpGet("auth")]
    public ActionResult<string> GetSecret()
    {
      return "Secret text";
    }

    [HttpGet("not-found")]
    public ActionResult<AppUser> GetNotFound()
    {
      var thing = _context.Users.Find(-1);

      if (thing == null) return NotFound();

      return Ok(thing);
    }

    [HttpGet("server-error")]
    public ActionResult<string> GetServerError()
    {
      var thing = _context.Users.Find(-1);

      var thingToReturn = thing.ToString();

      return (thingToReturn);
    }

    [HttpGet("bad-request")]
    public ActionResult<string> GetBadRequest()
    {
      return BadRequest("This was a bad request");
    }
  }
}