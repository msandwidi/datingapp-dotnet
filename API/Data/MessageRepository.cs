using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data
{
  public class MessageRepository : IMessageRepository
  {
    private readonly DataContext _context;
    private readonly IMapper _mapper;
    public MessageRepository(DataContext context, IMapper mapper)
    {
      _context = context;
      _mapper = mapper;

    }

    public void AddGroup(Group group)
    {
      _context.Groups.Add(group);
    }

    public void AddMessage(Message message)
    {
      _context.Messages.Add(message);
    }

    public void DeleteMessage(Message message)
    {
      _context.Messages.Remove(message);
    }

    public async Task<Connection> GetConnection(string connectionId)
    {
      return await _context.Connections.FindAsync(connectionId);
    }

    public async Task<Group> GetGroupForConnection(string connectionId)
    {
      return await _context.Groups
        .Include(g=>g.Connections)
        .Where(g=>g.Connections.Any(c=>c.ConnectionId==connectionId)).FirstOrDefaultAsync();
    }

    public async Task<Message> GetMessage(int messageId)
    {
      return await _context.Messages
      .Include(m => m.Sender)
      .Include(m => m.Recipient)
      .SingleOrDefaultAsync(m => m.Id == messageId);
    }

    public async Task<PagedList<MessageDto>> GetMessageForUser(MessageParams messageParams)
    {
      var query = _context.Messages
      .OrderByDescending(m => m.MessageSent)
      .ProjectTo<MessageDto>(_mapper.ConfigurationProvider)
      .AsQueryable();

      query = messageParams.Container switch
      {
        "Inbox" => query.Where(u => u.RecipientUsername == messageParams.Username && u.RecipientDeleted == false),
        "Outbox" => query.Where(u => u.SenderUsername == messageParams.Username && u.SenderDeleted == false),
        _ => query.Where(u => u.RecipientUsername == messageParams.Username && u.RecipientDeleted == false && u.DateRead == null),
      };


      return await PagedList<MessageDto>.CreateAsync(query, messageParams.PageNumber, messageParams.PageSize);
    }

    public async Task<Group> GetMessageGroup(string groupName)
    {
      return await _context.Groups.Include(g => g.Connections).FirstOrDefaultAsync(g => g.Name == groupName);
    }

    public async Task<IEnumerable<MessageDto>> GetMessageThread(string currentUsername, string recipientUsername)
    {
      var messages = await _context.Messages
        .Where(m => m.Recipient.UserName == currentUsername && m.RecipientDeleted == false && m.Sender.UserName == recipientUsername || m.Recipient.UserName == recipientUsername && m.SenderDeleted == false && m.Sender.UserName == currentUsername)
        .OrderBy(m => m.MessageSent)
        .ProjectTo<MessageDto>(_mapper.ConfigurationProvider)
        .ToListAsync();

      var unreadmessges = messages.Where(m => m.DateRead == null && m.RecipientUsername == currentUsername).ToList();

      if (unreadmessges.Any())
      {
        foreach (var message in unreadmessges)
        {
          message.DateRead = DateTime.UtcNow;
        }
      }

      return messages;
    }

    public void RemoveConnection(Connection connection)
    {
      _context.Connections.Remove(connection);
    }
    
  }
}