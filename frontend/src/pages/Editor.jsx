import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Container, TextField, Button, Box, Stack, Alert, CircularProgress, Dialog,
  DialogTitle, DialogContent, DialogActions
} from '@mui/material'
import client from '../api/client'

import RichEditor from '../components/RichEditor'

import Navbar from '../components/Navbar' 

export default function Editor() {
  const { id } = useParams()        // if present, we are editing
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(!!id)
  const [saving, setSaving] = useState(false)
  const [err, setErr] = useState('')
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Load existing note
  useEffect(() => {
    if (!id) return
    let alive = true
    ;(async () => {
      setErr(''); setLoading(true)
      try {
        const res = await client.get(`/notes/${id}`)
        if (!alive) return
        setTitle(res.data.note?.title || '')
        setContent(res.data.note?.content || '')
      } catch (e) {
        setErr(e.response?.data?.message || 'Failed to load note')
      } finally {
        setLoading(false)
      }
    })()
    return () => { alive = false }
  }, [id])

  const handleSave = async () => {
    setErr('')
    if (!title.trim() && !content.trim()) {
      setErr('Please write a title or content before saving')
      return
    }
    try {
      setSaving(true)
      if (id) {
        await client.put(`/notes/${id}`, { title, content })
      } else {
        await client.post('/notes', { title, content })
      }
      navigate('/dashboard')
    } catch (e) {
      setErr(e.response?.data?.message || 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    navigate('/dashboard')
  }

  const handleDelete = async () => {
    try {
      setSaving(true)
      await client.delete(`/notes/${id}`)
      navigate('/dashboard')
    } catch (e) {
      setErr(e.response?.data?.message || 'Delete failed')
    } finally {
      setSaving(false)
      setConfirmOpen(false)
    }
  }

  if (loading) {
    return (
      <>
        {/* <Navbar /> */}
        <Container sx={{ mt: 6, textAlign: 'center' }}>
          <CircularProgress />
        </Container>
      </>
    )
  }

  return (
    <>
      <Navbar />
      <Container sx={{ mt: 4, mb: 6 }}>
        <Stack spacing={2}>
          {err && <Alert severity="error">{err}</Alert>}

          <TextField
            label="Title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            inputProps={{ maxLength: 120 }}
          />

          <RichEditor value={content} onChange={setContent} />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? 'Saving…' : 'Save'}
            </Button>

            <Button variant="outlined" onClick={handleCancel} disabled={saving}>
              Cancel
            </Button>

            {!!id && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => setConfirmOpen(true)}
                disabled={saving}
                sx={{ ml: 'auto' }}
              >
                Delete
              </Button>
            )}
          </Box>
        </Stack>

        {/* Delete confirmation dialog */}
        <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
          <DialogTitle>Delete this note?</DialogTitle>
          <DialogContent>
            This action cannot be undone.
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
            <Button color="error" onClick={handleDelete}>Delete</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  )
}
