'use client'

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';

interface File {
  id: string;
  name: string;
}

interface Files {
  spreadsheets: File[];
  presentations: File[];
}

export default function HomeContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [files, setFiles] = useState<Files>({ spreadsheets: [], presentations: [] });
  const [error, setError] = useState('');

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('auth') === 'success') {
      setIsAuthenticated(true);
      fetchFiles();
    } else {
      checkAuthStatus();
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/api/google/files', {
        credentials: 'include'
      });
      
      if (response.ok) {
        setIsAuthenticated(true);
        const data: Files = await response.json();
        setFiles(data);
      } else if (response.status === 401) {
        setIsAuthenticated(false);
        // Redirect to login if authentication has expired
        window.location.href = '/api/auth/google/url';
      } else {
        throw new Error('Failed to check auth status');
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setError('Failed to check authentication status');
    }
  };

  const fetchFiles = async () => {
    try {
      const response = await fetch('/api/google/files', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data: Files = await response.json();
        setFiles(data);
      } else {
        throw new Error('Failed to fetch files');
      }
    } catch (error) {
      console.error('Error fetching files:', error);
      setError('Failed to fetch files');
    }
  };

  const handleLogin = async () => {
    try {
      const response = await fetch('/api/auth/google/url');
      const { url } = await response.json();
      window.location.href = url;
    } catch (error) {
      console.error('Error getting auth URL:', error);
      setError('Failed to initiate login');
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!isAuthenticated) {
    return (
      <div>
        <h1>Welcome to Google Drive Integration</h1>
        <Button onClick={handleLogin}>Login with Google</Button>
      </div>
    );
  }

  return (
    <div>
      <h1>Your Google Drive Files</h1>
      <h2>Spreadsheets</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.spreadsheets.map((file) => (
            <TableRow key={file.id}>
              <TableCell>{file.name}</TableCell>
              <TableCell>{file.id}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <h2>Presentations</h2>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>ID</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {files.presentations.map((file) => (
            <TableRow key={file.id}>
              <TableCell>{file.name}</TableCell>
              <TableCell>{file.id}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}