import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import { CircleCheck, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface APIError {
  message: string;
}

interface PermissionsAPIResponse {
  binary_value: number;
  equation: string;
}

interface Role {
  id: number;
  name: string;
  permissions: string[];
  can_manage_roles: boolean;
}

export default function Index() {
  const { toast } = useToast();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [roleName, setRoleName] = useState<string>('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [apiResponse, setApiResponse] = useState<PermissionsAPIResponse>({
    binary_value: 0,
    equation: '',
  });

  const calculatePermissions = async (permissions: string[]) => {
    try {
      const response = await fetch('http://localhost:4000/permissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissions }),
      });

      if (!response.ok) {
        const error: APIError = await response.json();
        throw new Error(error.message);
      }

      setApiResponse(await response.json());
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error sending permissions to API:', error.message);
      } else {
        console.error('Unknown error occurred:', error);
      }
    }
  };

  const createRole = async (name: string, permissions: number) => {
    if (!name) {
      toast({
        variant: 'destructive',
        title: 'Something went wrong!',
        description: 'Role name is required',
      });

      return;
    }

    try {
      const response = await fetch('http://localhost:4000/roles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: { name, permissions },
        }),
      });

      if (!response.ok) {
        const error: APIError = await response.json();
        throw new Error(error.message);
      }

      loadRoles();
      toast({
        title: 'The action was successful!',
        description: 'Role created successfully',
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error sending role to API:', error.message);
      } else {
        console.error('Unknown error occurred:', error);
      }

      toast({
        variant: 'destructive',
        title: 'Something went wrong!',
        description: 'Failed to create role',
      });
    }
  };

  const deleteRole = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:4000/roles/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error: APIError = await response.json();
        throw new Error(error.message);
      }

      loadRoles();
      toast({
        title: 'The action was successful!',
        description: 'Role deleted successfully',
      });
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error deleting role from API:', error.message);
      } else {
        console.error('Unknown error occurred:', error);
      }

      toast({
        variant: 'destructive',
        title: 'Something went wrong!',
        description: 'Failed to delete role',
      });
    }
  };

  const loadPermissions = async () => {
    try {
      const response = await fetch('http://localhost:4000/permissions');

      if (!response.ok) {
        const error: APIError = await response.json();
        throw new Error(error.message);
      }

      const permissions = await response.json();

      setPermissions(permissions.permissions);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching permissions from API:', error.message);
      } else {
        console.error('Unknown error occurred:', error);
      }
    }
  };

  const loadRoles = async () => {
    try {
      const response = await fetch('http://localhost:4000/roles');

      if (!response.ok) {
        const error: APIError = await response.json();
        throw new Error(error.message);
      }

      const roles = await response.json();

      const rolesData = await Promise.all(
        roles.data.map(async (role: Role) => {
          const response = await fetch(
            `http://localhost:4000/permissions/${role.permissions}`
          );

          const response2 = await fetch(
            `http://localhost:4000/test_permissions/${role.name}`
          );

          if (!response.ok) {
            const error: APIError = await response.json();
            throw new Error(error.message);
          }

          if (!response2.ok) {
            const error: APIError = await response2.json();
            throw new Error(error.message);
          }

          const can_manage = await response2.json();
          const permissions = await response.json();
          return { ...role, ...permissions, ...can_manage };
        })
      );

      console.log(rolesData);

      setRoles(rolesData);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error('Error fetching roles from API:', error.message);
      } else {
        console.error('Unknown error occurred:', error);
      }
    }
  };

  const handleCheckboxChange = (event: React.MouseEvent<HTMLButtonElement>) => {
    const permissionId = event.currentTarget.id;
    const isChecked =
      event.currentTarget.getAttribute('data-state') !== 'checked';

    setSelectedPermissions((prev: string[]) => {
      if (isChecked) {
        if (!prev.includes(permissionId)) {
          return [...prev, permissionId];
        }
      } else {
        return prev.filter((id) => id !== permissionId);
      }

      return prev;
    });
  };

  useEffect(() => {
    calculatePermissions(selectedPermissions);
  }, [selectedPermissions]);

  useEffect(() => {
    loadRoles();
    loadPermissions();
  }, []);

  const handleCreateRole = () => {
    createRole(roleName, apiResponse.binary_value);
  };

  return (
    <div className='container'>
      <div className='py-2'>
        <h1 className='y-2 font-bold text-black text-3xl'>
          Permissions Calculator: {apiResponse.binary_value}
        </h1>
        <p className='text-slate-500 text-xs'>
          Equation: {apiResponse.binary_value} = {apiResponse.equation}
        </p>
      </div>
      <div className='py-6 flex flex-wrap gap-5'>
        {permissions.length > 0 &&
          permissions.map((permission) => (
            <div key={permission} className='flex items-center space-x-2'>
              <Checkbox id={permission} onClick={handleCheckboxChange} />
              <Label htmlFor={permission}>{permission}</Label>
            </div>
          ))}
      </div>
      <div className='pt-8 flex flex-row gap-5'>
        <Input
          name='role_name'
          placeholder='Role name'
          className='w-[250px]'
          onChange={(event) => setRoleName(event.target.value)}
        />
        <Button onClick={handleCreateRole}>Create role</Button>
      </div>
      <Table className='my-6'>
        <TableHeader>
          <TableRow>
            <TableHead className='w-[100px]'>ID</TableHead>
            <TableHead className='w-[200px]'>Name</TableHead>
            <TableHead className='w-[300px]'>Permissions</TableHead>
            <TableHead className='w-[100px]'>Role Manager</TableHead>
            <TableHead className='w-[300px]'>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.length > 0 ? (
            roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell>{role.id}</TableCell>
                <TableCell>{role.name}</TableCell>
                <TableCell className='space-x-1 space-y-1'>
                  {role.permissions.length > 0
                    ? role.permissions.map((permission) => (
                        <Badge key={permission} variant='default'>
                          {permission}
                        </Badge>
                      ))
                    : 'No permissions'}
                </TableCell>
                <TableCell>
                  {role.can_manage_roles ? (
                    <CircleCheck className='text-green-600' />
                  ) : (
                    <XCircle className='text-red-600' />
                  )}
                </TableCell>
                <TableCell>
                  <Button variant='default'>Edit</Button>
                  <Button
                    className='ml-2'
                    variant='destructive'
                    onClick={() => deleteRole(role.id)}
                  >
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4}>No roles found</TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
