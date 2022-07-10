using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using API.Data;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
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
    private readonly IPhotoService _photoService;
    public UsersController(IUserRepository userRepositiry, IMapper mapper, IPhotoService photoService)
    {
      _photoService = photoService;
      _mapper = mapper;
      _userRepositiry = userRepositiry;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MemberDto>>> GetUsers([FromQuery] UserParams userParams)
    {

      var user = await _userRepositiry.GetUserByUsernameAsync(User.GetUsername());


      userParams.CurrentUsername = User.GetUsername();

      if (string.IsNullOrEmpty(userParams.Gender))
      {
        userParams.Gender = user.Gender == "male" ? "female" : "male";
      }

      var users = await _userRepositiry.GetMemberAsync(userParams);

      Response.AddPaginationHeader(users.CurrentPage, userParams.PageSize, users.TotalCount, users.TotalPages);

      return Ok(users);
    }

    [HttpGet("{username}", Name = "GetUser")]
    public async Task<ActionResult<MemberDto>> GetUser(string username)
    {
      return await _userRepositiry.GetMemberAsync(username);
    }

    [HttpPut]
    public async Task<ActionResult> UpdateUser(MemberUpdateDto memberUpdateDto)
    {
      var user = await _userRepositiry.GetUserByUsernameAsync(User.GetUsername());

      _mapper.Map(memberUpdateDto, user);

      _userRepositiry.Update(user);

      if (await _userRepositiry.SaveAllAsync()) return NoContent();

      return BadRequest("Failed to update user");
    }

    [HttpPost("add-photo")]
    public async Task<ActionResult<PhotoDto>> AddPhoto(IFormFile file)
    {
      var user = await _userRepositiry.GetUserByUsernameAsync(User.GetUsername());

      var result = await _photoService.AddPhotoAssync(file);

      if (result.Error != null) return BadRequest(result.Error.Message);

      var photo = new Photo
      {
        Url = result.SecureUrl.AbsoluteUri,
        PublicId = result.PublicId,
      };

      if (user.Photos.Count == 0) photo.IsMain = true;

      user.Photos.Add(photo);

      if (await _userRepositiry.SaveAllAsync())
      {
        return CreatedAtRoute("GetUser", new { username = user.UserName }, _mapper.Map<PhotoDto>(photo));
      }

      return BadRequest("Problem adding photo");
    }

    [HttpPut("set-main-photo/{photoId}")]
    public async Task<ActionResult> SetMainPhoto(int photoId)
    {
      var user = await _userRepositiry.GetUserByUsernameAsync(User.GetUsername());

      var photo = user.Photos.FirstOrDefault(p => p.Id == photoId);

      if (photo.IsMain) return BadRequest("This is already your main photo");

      var currentMain = user.Photos.FirstOrDefault(p => p.IsMain);

      if (currentMain != null) currentMain.IsMain = false;

      photo.IsMain = true;

      if (await _userRepositiry.SaveAllAsync()) return NoContent();

      return BadRequest("Failed to set main photo");
    }

    [HttpDelete("delete-photo/{photoId}")]
    public async Task<ActionResult> DeletePhoto(int photoId)
    {
      var user = await _userRepositiry.GetUserByUsernameAsync(User.GetUsername());
      var photo = user.Photos.FirstOrDefault(p => p.Id == photoId);

      if (photo == null) return NotFound();

      if (photo.IsMain) return BadRequest("You cannot delete your main photo");

      if (photo.PublicId != null)
      {
        var result = await _photoService.DeletePhotoAssync(photo.PublicId);
        if (result.Error != null) return BadRequest(result.Error);
      }

      user.Photos.Remove(photo);

      if (await _userRepositiry.SaveAllAsync()) return Ok();

      return BadRequest("Failed to delete photo");
    }
  }
}