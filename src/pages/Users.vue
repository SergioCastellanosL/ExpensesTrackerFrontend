<script setup>
  import { DataTable, Column, InputText, Card, Button, useConfirm, 
    useToast, Toast, ConfirmDialog, Dialog, Password, Message } from 'primevue';
  import { ref, onMounted } from 'vue';
  import {zodResolver} from "@primevue/forms/resolvers/zod";
  import { Form } from '@primevue/forms';
  import {z} from 'zod';

  const confirm = useConfirm();
  const toast = useToast();
  const users = ref([]);
  const editingRows = ref([]);
  const showForm = ref(false)
  const initialValues = ref({username:'', password:''})
  onMounted(async () => {
    try{
      const res = await fetch('http://10.0.0.6:3000/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      users.value = await res.json();
    }catch(err){
      console.error(err);
    }
  });
  const onRowEditSave = async (event) => {
    let { newData, index } = event;
    const userIndex = users.value.findIndex((u) => u.id === newData.id);
    if (userIndex === -1) {
      alert("User not found in list.");
      return;
    }
    const usernameExists = users.value.some(
      (user, i) => user.username === newData.username && i !== userIndex
    );
    if (usernameExists) {
      alert('Username already exists. Please choose a different one.');
      return;
    }
    try {
      const response = await fetch(`http://10.0.0.6:3000/users/${newData.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newData),
      });

      if (!response.ok) {
        if (response.status === 409) {
          alert("Username already exists in the database.");
        } else {
          alert("Failed to update user in the database.");
        }
        return;
      }
      users.value[userIndex] = newData;

      console.log("User updated successfully");
    } catch (error) {
      console.error("Error updating user:", error);
      alert("Network or server error while updating user.");
    }
  };
  const confirm1 = (id) => {
    confirm.require({
      message: 'Do you want to delete this user?',
      header: 'Danger Zone',
      icon: 'pi pi-info-circle',
      rejectLabel: 'Cancel',
      rejectProps: {
          label: 'Cancel',
          severity: 'secondary',
          outlined: true
      },
      acceptProps: {
            label: 'Delete',
            severity: 'danger'
      },
      accept: async () => {
        try {
          const response = await fetch(`http://10.0.0.6:3000/users/${id}`, {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            }
          });
          if (!response.ok) {
            const error = await response.text();
            throw new Error(error || "Failed to delete user");
          }
          users.value = users.value.filter(u => u.id !== id);
          toast.add({ severity: 'success', summary: 'Deleted', detail: 'User deleted', life: 3000 });
        } catch (error) {
          toast.add({ severity: 'error', summary: 'Rejected', detail: 'Action canceled', life: 3000 });
        }
      },
      reject: () => {
          toast.add({ severity: 'error', summary: 'Rejected', detail: 'Action canceled', life: 3000 });
      }
    });
  }

  const resolver = ref(zodResolver(
    z.object({
        username: z.string().min(1, { message: 'Username is required.' }),
        password: z
            .string()
            .min(6, { message: 'Minimum 3 characters.' })
            .refine((value) => /[a-z]/.test(value), {
                message: 'Must have a lowercase letter.'
            })
            .refine((value) => /[A-Z]/.test(value), {
                message: 'Must have an uppercase letter.'
            })
            .refine((value) => /\d/.test(value), {
                message: 'Must have a number.'
            })
    })
  ));

  const addUser = async (e) => {
    if (e.valid) {
        toast.add({ severity: 'success', summary: 'Form is submitted.', life: 3000 });
      console.log(e);
      const {username, password} = e.values;
      try {
        const response = await fetch('http://10.0.0.6:3000/users',{
          method: 'POST',
          headers: {
            'Content-Type':'application/json',
          },
          body: JSON.stringify({
            username: username,
            password: password,
          }),
        })
        if (!response.ok){
          throw new Error('Failed to add user')
        }
        const newUser = await response.json();
        users.value.push(newUser);
        showForm.value =false;
      } catch (err) {
        console.error(err)
      }
    }
  }
</script>

<template>
  <Toast/>
  <ConfirmDialog></ConfirmDialog>
  <Card>
    <template #title>
      <div class="flex justify-between items-center">
        <span>Users</span>
        <Button
          icon="pi pi-plus"
          label="Add User"
          class="p-button-sm"
          @click="showForm = true"
        />
      </div>
    </template>
    <template #content>
      <DataTable v-model:editingRows="editingRows" :value="users" editMode="row" dataKey="id" @row-edit-save="onRowEditSave" paginator :rows="5" :rowsPerPageOptions="[5, 10, 20, 50]" tableStyle=""
        :pt="{
            table: { style: '' },
            column: {
                bodycell: ({ state }) => ({
                    style:  state['d_editing']&&'padding-top: 0.75rem; padding-bottom: 0.75rem'
                })
            }
        }">
        <Column field="id" header="Id" sortable ></Column>
        <Column field="username" header="Username" sortable>
          <template #editor="{data,field}">
            <InputText v-model="data[field]" fluid/>
          </template>
        </Column>
        <Column field="created_at" header="Created at" sortable></Column>
        <Column :rowEditor="true" style="width: 10%; padding-right: 0rem;" bodyStyle="text-align:center"></Column>
        <Column header="" style="width: 10%; padding-left: 0rem;text-align:center;">
          <template #body="{ data }">
            <Button
              icon="pi pi-trash"
              severity="danger"
              class="p-button-text"
              rounded
              @click="confirm1(data.id)"
            />
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>

  <Dialog v-model:visible="showForm" modal header="Add User" :style="{ width: '25rem' }">
    <Form v-slot="$form" :initialValues :resolver @submit="addUser">
      <div class="flex items-center gap-4 mb-4">
        <label for="username" class="font-semibold w-24">Username</label>
        <InputText name="username" class="flex-auto" autocomplete="off" />
      </div>
      <Message v-if="$form.username?.invalid" severity="error" size="small" variant="simple" class="mb-4 ml-30">{{ $form.username.error.message }}</Message>
      <div class="flex items-center gap-4 mb-4">
          <label for="password" class="font-semibold w-24">Password</label>
          <div class="flex flex-col grow">
            <Password name="password" placeholder="Password" :feedback="false" toggleMask fluid />
          </div>
      </div>
      <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple" class="mb-4 ml-30">
        <ul class="my-0 flex flex-col gap-1">
          <li v-for="(error, index) of $form.password.errors" :key="index">{{ error.message }}</li>
        </ul>
      </Message>
      
      <div class="flex justify-end gap-2">
          <Button type="button" label="Cancel" severity="secondary" @click="showForm = false"></Button>
          <Button type="submit" label="Save"></Button>
      </div>
    </Form>
  </Dialog>
</template>
<style scoped></style>