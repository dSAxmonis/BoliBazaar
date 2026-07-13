import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { editAuction, fetchUserAuctions } from '../../../services/operations/auctionAPI';
import { setEditAuctionForm, clearEditAuctionForm } from '../../../slices/profileSlice';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Input } from '../../ui/input';
import { Label } from '../../ui/label';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import toast from 'react-hot-toast';

const EditAuction = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const editAuctionForm = useSelector((state) => state.profile.editAuctionForm);

  const [form, setForm] = useState({
    title: '',
    description: '',
    startingPrice: '',
    auctionEndTime: '',
    image: null,
    preview: null
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!editAuctionForm || editAuctionForm._id !== id) {

      fetchUserAuctions().then((auctions) => {
        const found = auctions.find((a) => a._id === id);
        if (found) {
          dispatch(setEditAuctionForm(found));
        }
      });
    }
  }, [id, editAuctionForm, dispatch]);

  useEffect(() => {
    if (editAuctionForm && editAuctionForm._id === id) {
      setForm({
        title: editAuctionForm.title || '',
        description: editAuctionForm.description || '',
        startingPrice: editAuctionForm.startingPrice || '',
        auctionEndTime: editAuctionForm.auctionEndTime ? editAuctionForm.auctionEndTime.split('T')[0] : '',
        image: null,
        preview: editAuctionForm.images?.url || null
      });
    }
  }, [editAuctionForm, id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm((prev) => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => setForm((prev) => ({ ...prev, preview: reader.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setForm((prev) => ({ ...prev, image: null, preview: null }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', form.title);
      formData.append('description', form.description);
      formData.append('startingPrice', form.startingPrice);
      formData.append('auctionEndTime', form.auctionEndTime);
      if (form.image) {
        formData.append('image', form.image);
      }
      const updated = await editAuction(id, formData);
      if (updated) {
        toast.success('Auction updated successfully!');
        dispatch(clearEditAuctionForm());
        navigate('/dashboard/my-auctions');
      } else {
        toast.error('Failed to update auction');
      }
    } catch (error) {
      toast.error('Error updating auction');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 p-8">
      <Card className="w-full max-w-2xl shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-800">Edit Auction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="flex flex-col items-center space-y-4">
              <div className="w-32 h-32 relative bg-gray-100 rounded-xl overflow-hidden border-2 border-dashed border-gray-300">
                {form.preview ? (
                  <img src={form.preview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>
                )}
                {form.preview && (
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                  >
                    Remove
                  </button>
                )}
              </div>
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="text-sm">
                {form.preview ? 'Change Photo' : 'Upload Photo'}
              </Button>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleImageChange}
              />
            </div>
            
            <div>
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" value={form.title} onChange={handleChange} required />
            </div>
            
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" value={form.description} onChange={handleChange} required />
            </div>
            
            <div>
              <Label htmlFor="startingPrice">Starting Price</Label>
              <Input id="startingPrice" name="startingPrice" type="number" value={form.startingPrice} onChange={handleChange} required />
            </div>
            
            <div>
              <Label htmlFor="auctionEndTime">Auction End Date</Label>
              <Input id="auctionEndTime" name="auctionEndTime" type="date" value={form.auctionEndTime} onChange={handleChange} required />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 text-lg transition-all duration-200 disabled:opacity-50">
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default EditAuction;
