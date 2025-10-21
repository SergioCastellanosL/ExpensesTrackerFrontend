<script setup>
  import { DataTable, Column, InputText, Card, Button } from 'primevue';
  import { ref, onMounted } from 'vue';
  const users = ref([]);
  const editingRows = ref([]);
  onMounted(async () => {
    try{
      const res = await fetch('http://10.0.0.6:3000/users');
      if (!res.ok) throw new Error('Failed to fetch users');
      users.value = await res.json();
    }catch{
      console.error(err);
    }
  });
  const onRowEditSave = (event) => {
    let { newData, index } = event;
    users.value[index] = newData;
  };
</script>

<template>
  <Card>
    <template #title>Users</template>
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
              @click="deleteUser(data.id)"
            />
          </template>
        </Column>
      </DataTable>
    </template>
  </Card>
  
</template>
<style scoped></style>