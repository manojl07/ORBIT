import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { createPost } from '../../api/post.api'

const CreatePostModal = ({ isOpen, onClose }) => {

  const queryClient = useQueryClient();

  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState("")

  const createPostMutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feed"] });

      toast.success("Post created 🚀")

      setCaption("")
      setImage(null);
      setPreview("")

      onClose();


    },

    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to create post")
    }
  })


  const handleImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    setImage(file);

    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();

    formData.append("caption", caption);

    formData.append("image", image);

    createPostMutation.mutate(formData);
  }

  if (!isOpen) return null;


  return (
    <div className='fixed inset-0 bg-black/70 flex items-center justify-center z-50'>

      <div className='bg-zinc-900 p-6 rounded-xl w-full max-w-md'>

        <h2 className='text-white text-xl font-bold mb-4'>Create Post</h2>

        <form onSubmit={handleSubmit}>

          <input
            type="file"
            accept='image/*'
            onChange={handleImage}
            className='text-white mb-4'
          />

          {preview && (
            <img src={preview} alt="" className='w-full rounded-lg mb-4' />
          )}

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder='Write a caption...'
            className='w-full rounded-lg bg-zinc-800 text-white p-2 resize-none'
          ></textarea>

          <div className='flex gap-2 mt-4'>

            <button
              type='submit'
              disabled={createPostMutation.isPending}
              className='flex-1 bg-blue-600 text-white p-3 rounded-lg'>
              {createPostMutation.isPending
                ? "Uploading..."
                : "Create"
              }
            </button>

            <button type='button' onClick={onClose} className='flex-1 bg-zinc-700 text-white p3 rounded-lg'>
              Cancel
            </button>

          </div>

        </form>

      </div>

    </div>
  )
}

export default CreatePostModal