import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, Edit, Trash2, Plus, Tag, MessageSquare } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const Index = () => {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const storedNotes = JSON.parse(localStorage.getItem('notes')) || [];
    setNotes(storedNotes);
  }, []);

  useEffect(() => {
    localStorage.setItem('notes', JSON.stringify(notes));
  }, [notes]);

  const login = () => {
    if (username === 'user' && password === 'pass') {
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Invalid username or password');
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUsername('');
    setPassword('');
  };

  const addNote = () => {
    const newNote = {
      id: Date.now(),
      title: 'New Note',
      content: '',
      color: '#ffffff',
      tags: [],
      comments: [],
      createdAt: new Date().toISOString(),
    };
    setNotes([...notes, newNote]);
    setCurrentNote(newNote);
  };

  const updateNote = (updatedNote) => {
    setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note));
    setCurrentNote(updatedNote);
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
    setCurrentNote(null);
  };

  const addComment = (noteId, comment) => {
    const updatedNotes = notes.map(note => {
      if (note.id === noteId) {
        return { ...note, comments: [...note.comments, { id: Date.now(), text: comment }] };
      }
      return note;
    });
    setNotes(updatedNotes);
    setCurrentNote(updatedNotes.find(note => note.id === noteId));
  };

  const getNotesPerDay = () => {
    const counts = {};
    notes.forEach(note => {
      const date = new Date(note.createdAt).toLocaleDateString();
      counts[date] = (counts[date] || 0) + 1;
    });
    return Object.entries(counts).map(([date, count]) => ({ date, count }));
  };

  if (!isLoggedIn) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <Card className="w-96">
          <CardHeader>
            <h2 className="text-2xl font-bold text-center">Login</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); login(); }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              {loginError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{loginError}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" className="w-full">Login</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Notes App</h1>
        <Button onClick={logout}>Logout</Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-4">
          <Button onClick={addNote} className="w-full"><Plus className="mr-2" /> Add Note</Button>
          {notes.map(note => (
            <Card key={note.id} className="cursor-pointer" onClick={() => setCurrentNote(note)} style={{ backgroundColor: note.color }}>
              <CardHeader>
                <h3 className="font-semibold">{note.title}</h3>
              </CardHeader>
              <CardContent>
                <p className="truncate">{note.content}</p>
                <div className="flex flex-wrap mt-2">
                  {note.tags.map(tag => (
                    <span key={tag} className="bg-gray-200 rounded-full px-2 py-1 text-sm mr-1 mb-1">{tag}</span>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="md:col-span-2">
          {currentNote ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <Input
                  value={currentNote.title}
                  onChange={(e) => updateNote({ ...currentNote, title: e.target.value })}
                  className="text-xl font-bold"
                />
                <div className="space-x-2">
                  <Button onClick={() => deleteNote(currentNote.id)} variant="destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={currentNote.content}
                  onChange={(e) => updateNote({ ...currentNote, content: e.target.value })}
                  rows={10}
                />
                <div className="flex items-center space-x-2">
                  <Label htmlFor="color">Color:</Label>
                  <Input
                    id="color"
                    type="color"
                    value={currentNote.color}
                    onChange={(e) => updateNote({ ...currentNote, color: e.target.value })}
                    className="w-12 h-8"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor="tags">Tags:</Label>
                  <Input
                    id="tags"
                    placeholder="Add tags (comma-separated)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        const newTags = e.target.value.split(',').map(tag => tag.trim());
                        updateNote({ ...currentNote, tags: [...new Set([...currentNote.tags, ...newTags])] });
                        e.target.value = '';
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap">
                  {currentNote.tags.map(tag => (
                    <span key={tag} className="bg-gray-200 rounded-full px-2 py-1 text-sm mr-1 mb-1">
                      {tag}
                      <button
                        onClick={() => updateNote({ ...currentNote, tags: currentNote.tags.filter(t => t !== tag) })}
                        className="ml-1 text-red-500"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
                <div className="space-y-2">
                  <h4 className="font-semibold">Comments</h4>
                  {currentNote.comments.map(comment => (
                    <div key={comment.id} className="bg-gray-100 p-2 rounded">
                      {comment.text}
                    </div>
                  ))}
                  <div className="flex items-center space-x-2">
                    <Input
                      placeholder="Add a comment"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim()) {
                          addComment(currentNote.id, e.target.value.trim());
                          e.target.value = '';
                        }
                      }}
                    />
                    <Button onClick={() => {
                      const input = document.querySelector('input[placeholder="Add a comment"]');
                      if (input.value.trim()) {
                        addComment(currentNote.id, input.value.trim());
                        input.value = '';
                      }
                    }}>
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <p className="text-center text-gray-500 my-8">Select a note or create a new one</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Card className="mt-8">
        <CardHeader>
          <h2 className="text-xl font-bold">Notes Created Per Day</h2>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={getNotesPerDay()}>
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;