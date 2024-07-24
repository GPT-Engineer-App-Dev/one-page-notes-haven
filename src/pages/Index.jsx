import React, { useState, useEffect, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AlertCircle, Edit, Trash2, Plus, Tag, MessageSquare, Grid, Layout } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";

const Index = () => {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isCanvasMode, setIsCanvasMode] = useState(false);
  const [draggedNote, setDraggedNote] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const storedNotes = JSON.parse(localStorage.getItem('notes')) || [];
    setNotes(storedNotes.map(note => ({
      ...note,
      x: note.x || Math.random() * (window.innerWidth - 200),
      y: note.y || Math.random() * (window.innerHeight - 200)
    })));
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
      x: Math.random() * (window.innerWidth - 200),
      y: Math.random() * (window.innerHeight - 200),
    };
    setNotes([...notes, newNote]);
    setCurrentNote(newNote);
    setIsDialogOpen(true);
  };

  const updateNote = (updatedNote) => {
    setNotes(notes.map(note => note.id === updatedNote.id ? updatedNote : note));
    setCurrentNote(updatedNote);
  };

  const deleteNote = (id) => {
    setNotes(notes.filter(note => note.id !== id));
    setCurrentNote(null);
    setIsDialogOpen(false);
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

  const handleDragStart = (e, note) => {
    setDraggedNote(note);
    e.dataTransfer.setData('text/plain', ''); // Required for Firefox
  };

  const handleDrag = (e) => {
    if (draggedNote && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setNotes(notes.map(note => 
        note.id === draggedNote.id ? { ...note, x, y } : note
      ));
    }
  };

  const handleDragEnd = () => {
    setDraggedNote(null);
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
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Label htmlFor="canvas-mode">Canvas Mode</Label>
            <Switch
              id="canvas-mode"
              checked={isCanvasMode}
              onCheckedChange={setIsCanvasMode}
            />
          </div>
          <Button onClick={logout}>Logout</Button>
        </div>
      </div>
      <Button onClick={addNote} className="mb-4"><Plus className="mr-2" /> Add Note</Button>
      {isCanvasMode ? (
        <div 
          ref={canvasRef}
          className="border border-gray-300 rounded-lg h-[600px] relative overflow-hidden"
          onDragOver={(e) => e.preventDefault()}
        >
          {notes.map(note => (
            <div
              key={note.id}
              draggable
              onDragStart={(e) => handleDragStart(e, note)}
              onDrag={handleDrag}
              onDragEnd={handleDragEnd}
              onClick={() => { setCurrentNote(note); setIsDialogOpen(true); }}
              className="absolute cursor-move"
              style={{
                left: `${note.x}px`,
                top: `${note.y}px`,
                backgroundColor: note.color,
                width: '200px',
                padding: '10px',
                borderRadius: '5px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
              }}
            >
              <h3 className="font-semibold truncate">{note.title}</h3>
              <p className="truncate">{note.content}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {notes.map(note => (
            <Card key={note.id} className="cursor-pointer" onClick={() => { setCurrentNote(note); setIsDialogOpen(true); }} style={{ backgroundColor: note.color }}>
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
      )}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          {currentNote && (
            <div className="space-y-4">
              <Input
                value={currentNote.title}
                onChange={(e) => updateNote({ ...currentNote, title: e.target.value })}
                className="text-xl font-bold"
              />
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
              <div className="flex justify-end space-x-2">
                <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
                <Button onClick={() => deleteNote(currentNote.id)} variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" /> Delete Note
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
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