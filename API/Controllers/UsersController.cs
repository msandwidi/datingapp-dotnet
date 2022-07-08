using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace API.Controllers
{
  [Authorize]
  public class UsersController : BaseApiController
  {
    private readonly IUserRepository _userRepositiry;
    private readonly IMapper _mapper;
    public UsersController(IUserRepository userRepositiry, IMapper mapper)
    {
      _mapper = mapper;
      _userRepositiry = userRepositiry;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MemberDto>>> GetUsers()
    {
      var users = await _userRepositiry.GetUsersAsync();
      return Ok(_mapper.Map<IEnumerable<MemberDto>>(users));
    }

    [HttpGet("{username}")]
    public async Task<ActionResult<MemberDto>> GetUser(string username){
     return _mapper.Map<MemberDto>(await _userRepositiry.GetUserByUsernameAsync(username));
    }
  }
}