import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Warehouse } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { useAuth } from "@/context/AuthProvider";


const Login = () => {
  const {setUser, setToken, setSelectedWarehouse}  = useAuth();
  const [trigram, setTrigram] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
  const handleSubmit = async (e:React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await axios.post(`${BACKEND_URL}/api/inventory/loginWarehouse`,{
        trigram,
        password
      })
      
      const user = response.data.user;
      const token = response.data.token;
      setUser(user);
      setToken(token);
      const defaultWarehouse = user.warehouses[0];
      setSelectedWarehouse(defaultWarehouse);
      toast.success('Login success.')
      console.log("Response auth: ",response.data)
      navigate('/dashboard')
    } catch (error:any) {
      console.log("Error occured while submitting login form: ", error);
      const status = error.response?.status;
      const backendMessage = error.response?.data.message;

      switch(status){
        case 400:
          toast.error(backendMessage || 'Missing required fields.');
          break;
        case 401:
          toast.error(backendMessage || 'Invalid Password');
          break;
        case 403:
          toast.error(backendMessage || "You don't have access for this company.")
          break;
        case 404:
          toast.error(backendMessage || 'User Not Found.')
          break;
        case 500:
          toast.error('Server error. Please try again later.')
          break;
        default:
          toast.error(backendMessage || `An error occurred: 'Unknown'`)
      }
    } finally{
      setLoading(false);
    }
  }
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-200/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-blue-500/10">
            <Warehouse className="h-6 w-6 text-blue-500"/>
          </div>
          <CardTitle className="text-2xl">Stock Management</CardTitle>
          <CardDescription>
            Sign in to manage your warehouses
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="trigram">Trigram</Label>
              <Input
                id="trigram"
                type="string"
                placeholder="Enter your trigram"
                value={trigram}
                onChange={(e)=> setTrigram(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e)=> setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button variant='default' className="w-full" disabled={loading}>
              {loading? 'Please wait...':'Sign In'}
            </Button>
          </CardFooter>
        </form>

      </Card>
    </div>
  )
}

export default Login