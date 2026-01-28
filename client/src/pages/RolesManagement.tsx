import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, Users, Key, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function RolesManagement() {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>('');

  const { data: roles, isLoading: rolesLoading } = trpc.roles.listRoles.useQuery();
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = trpc.roles.listUsersWithRoles.useQuery({
    page: 1,
    limit: 50,
  });
  const { data: myPermissions } = trpc.roles.getMyPermissions.useQuery();

  const assignRoleMutation = trpc.roles.assignRole.useMutation();

  const handleAssignRole = async (userId: number, role: string) => {
    try {
      await assignRoleMutation.mutateAsync({
        userId,
        role: role as any,
      });
      toast.success("Rol asignado correctamente");
      refetchUsers();
    } catch (error: any) {
      toast.error("Error al asignar rol: " + error.message);
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin':
        return 'destructive';
      case 'partner':
        return 'default';
      case 'technician':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'partner':
        return 'Partner';
      case 'technician':
        return 'Técnico';
      case 'user':
        return 'Usuario';
      default:
        return role;
    }
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Gestión de Roles y Permisos</h1>
        <p className="text-muted-foreground mt-2">
          Administra roles, permisos y control de acceso del sistema
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles">Roles y Permisos</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="my-permissions">Mis Permisos</TabsTrigger>
        </TabsList>

        {/* Roles y Permisos */}
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Roles del Sistema</CardTitle>
              <CardDescription>
                Permisos asignados a cada rol
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rolesLoading ? (
                <p className="text-center text-muted-foreground py-8">Cargando roles...</p>
              ) : roles && roles.length > 0 ? (
                <div className="space-y-6">
                  {roles.map((role) => (
                    <div key={role.role} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">{getRoleLabel(role.role)}</h3>
                        <Badge variant={getRoleBadgeVariant(role.role)}>
                          {role.permissions.length} permisos
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {role.permissions.map((perm) => (
                          <Badge key={perm} variant="outline">
                            <Key className="h-3 w-3 mr-1" />
                            {perm}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay roles configurados
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usuarios */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usuarios del Sistema</CardTitle>
              <CardDescription>
                Asigna roles a los usuarios
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <p className="text-center text-muted-foreground py-8">Cargando usuarios...</p>
              ) : usersData && usersData.users.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Rol Actual</TableHead>
                      <TableHead>Cambiar Rol</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersData.users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>#{user.id}</TableCell>
                        <TableCell>{user.name || 'Sin nombre'}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={getRoleBadgeVariant(user.role)}>
                            {getRoleLabel(user.role)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={selectedUserId === user.id ? selectedRole : user.role}
                            onValueChange={(value) => {
                              setSelectedUserId(user.id);
                              setSelectedRole(value);
                            }}
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue placeholder="Seleccionar rol" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">Usuario</SelectItem>
                              <SelectItem value="technician">Técnico</SelectItem>
                              <SelectItem value="partner">Partner</SelectItem>
                              <SelectItem value="admin">Administrador</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleAssignRole(user.id, selectedUserId === user.id ? selectedRole : user.role)}
                            disabled={selectedUserId !== user.id || selectedRole === user.role}
                          >
                            Aplicar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No hay usuarios registrados
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mis Permisos */}
        <TabsContent value="my-permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mis Permisos</CardTitle>
              <CardDescription>
                Permisos que tienes asignados actualmente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {myPermissions && myPermissions.length > 0 ? (
                <div className="space-y-3">
                  {myPermissions.map((perm) => (
                    <div key={perm} className="flex items-center gap-2 p-3 border rounded-lg">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span className="font-medium">{perm}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  No tienes permisos asignados
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
