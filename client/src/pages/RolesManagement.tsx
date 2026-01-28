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
import { useTranslation } from "@/hooks/use-translation";

export function RolesManagement() {
  const { t } = useTranslation();
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
      toast.success(t('rolesManagement.roleAssignedSuccess'));
      refetchUsers();
    } catch (error: any) {
      toast.error(t('rolesManagement.roleAssignedError', { message: error.message }));
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
        return t('rolesManagement.administrator');
      case 'partner':
        return t('rolesManagement.partner');
      case 'technician':
        return t('rolesManagement.technician');
      case 'user':
        return t('rolesManagement.user');
      default:
        return role;
    }
  };

  return (
    <div className="container py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t('rolesManagement.title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('rolesManagement.description')}
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="roles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roles">{t('rolesManagement.rolesAndPermissions')}</TabsTrigger>
          <TabsTrigger value="users">{t('rolesManagement.users')}</TabsTrigger>
          <TabsTrigger value="my-permissions">{t('rolesManagement.myPermissions')}</TabsTrigger>
        </TabsList>

        {/* Roles y Permisos */}
        <TabsContent value="roles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('rolesManagement.systemRoles')}</CardTitle>
              <CardDescription>
                {t('rolesManagement.permissionsAssignedToEachRole')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rolesLoading ? (
                <p className="text-center text-muted-foreground py-8">{t('rolesManagement.loadingRoles')}</p>
              ) : roles && roles.length > 0 ? (
                <div className="space-y-6">
                  {roles.map((role) => (
                    <div key={role.role} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Shield className="h-5 w-5 text-primary" />
                        <h3 className="text-lg font-semibold">{getRoleLabel(role.role)}</h3>
                        <Badge variant={getRoleBadgeVariant(role.role)}>
                          {t('rolesManagement.permissionsCount', { count: role.permissions.length })}
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
                  {t('rolesManagement.noRolesConfigured')}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usuarios */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('rolesManagement.systemUsers')}</CardTitle>
              <CardDescription>
                {t('rolesManagement.assignRolesToUsers')}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {usersLoading ? (
                <p className="text-center text-muted-foreground py-8">{t('rolesManagement.loadingUsers')}</p>
              ) : usersData && usersData.users.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('rolesManagement.id')}</TableHead>
                      <TableHead>{t('rolesManagement.name')}</TableHead>
                      <TableHead>{t('rolesManagement.email')}</TableHead>
                      <TableHead>{t('rolesManagement.currentRole')}</TableHead>
                      <TableHead>{t('rolesManagement.changeRole')}</TableHead>
                      <TableHead>{t('rolesManagement.actions')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersData.users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>#{user.id}</TableCell>
                        <TableCell>{user.name || t('rolesManagement.noName')}</TableCell>
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
                              <SelectValue placeholder={t('rolesManagement.selectRole')} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">{t('rolesManagement.user')}</SelectItem>
                              <SelectItem value="technician">{t('rolesManagement.technician')}</SelectItem>
                              <SelectItem value="partner">{t('rolesManagement.partner')}</SelectItem>
                              <SelectItem value="admin">{t('rolesManagement.administrator')}</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            onClick={() => handleAssignRole(user.id, selectedUserId === user.id ? selectedRole : user.role)}
                            disabled={selectedUserId !== user.id || selectedRole === user.role}
                          >
                            {t('rolesManagement.apply')}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  {t('rolesManagement.noUsersRegistered')}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Mis Permisos */}
        <TabsContent value="my-permissions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{t('rolesManagement.myPermissions')}</CardTitle>
              <CardDescription>
                {t('rolesManagement.myPermissionsDescription')}
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
                  {t('rolesManagement.noPermissionsAssigned')}
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
