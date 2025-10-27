<script setup>
    import { DataTable, Column, InputText, Card, Button, useConfirm, 
        useToast, Toast, ConfirmDialog, Dialog, Password, Message } from 'primevue';
    import { ref } from "vue";
    import { useRouter } from "vue-router";
    import {zodResolver} from "@primevue/forms/resolvers/zod";
    import { Form } from '@primevue/forms';
    import {z} from 'zod';

    const toast = useToast();
    const router = useRouter();

    const activeForm = ref("login");
    const showSignUp = () => activeForm.value = "signup";
    const showSignIn = () => activeForm.value = "login";

    const signInInitialValues = ref({username:'', password:''})
    const signUpInitialValues = ref({ username: '', password: '', confirmPassword: '' });
    const signInResolver = ref(zodResolver(
        z.object({
            username: z.string().min(1, { message: 'Username is required.' }),
            password: z
                .string()
                .min(1, { message: 'Password is required.' })
        })
    ));
    const signUpResolver = ref(zodResolver(
        z.object({
            username: z.string().min(1, { message: 'Username is required.' }),
            password: z.string().min(6, { message: 'Password must be at least 6 characters.' })
                .refine((value) => /[a-z]/.test(value), {
                    message: 'Must have a lowercase letter.'
                })
                .refine((value) => /[A-Z]/.test(value), {
                    message: 'Must have an uppercase letter.'
                })
                .refine((value) => /\d/.test(value), {
                    message: 'Must have a number.'
                }),
            confirmPassword: z.string().min(6, { message: 'Confirm your password.' })
        }).superRefine((data, ctx) => {
            if (data.password !== data.confirmPassword) {
                    ctx.addIssue({
                    code: "custom",
                    path: ["confirmPassword"],
                    message: "Passwords must match."
                });
            }
        })
    ));
    const signIn = async (e) => {
        if(!e.valid){
            return;
        }
        const {username, password} = e.values;
        try {
            const res = await fetch("http://10.0.0.6:3000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: username, password: password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            localStorage.setItem("token", data.token);
            toast.add({ severity: "success", summary: "Welcome", detail: "Login successful" });
            router.push("/"); // redirect after login
        } catch (err) {
            toast.add({ severity: "error", summary: "Error", detail: err.message });
        }
    }
    const signUp = async (e) => {
        if(!e.valid){
            return;
        }
        const {username, password} = e.values;
        try {
            const res = await fetch("http://10.0.0.6:3000/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username: username, password: password }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message);
            toast.add({ severity: "success", summary: "Welcome", detail: "Sign Up successful" });
            showSignIn();
        } catch (err) {
            toast.add({ severity: "error", summary: "Error", detail: err.message });
        }
    }
</script>

<template>
    <Toast/>
    <div class="flex justify-center mt-20">
        <Card v-if="activeForm === 'login'" :style="{ width: '25rem' }">
            <template #title>
                <div class="flex justify-between items-center">
                    <span>Sign In</span>
                </div>
            </template>
            <template #content>
                <Form v-slot="$form" :initialValues="signInInitialValues" :resolver="signInResolver" @submit="signIn">
                    <div class="flex items-center gap-4 mb-4">
                        <label for="username" class="font-semibold w-24">Username</label>
                        <InputText name="username" class="flex-auto" autocomplete="off" />
                    </div>
                    <div class="flex items-center gap-4 mb-4">
                        <label for="password" class="font-semibold w-24">Password</label>
                        <div class="flex flex-col grow">
                        <Password name="password" placeholder="Password" :feedback="false" toggleMask fluid />
                        </div>
                    </div>
                    <Message v-if="$form.username?.invalid" severity="error" size="small" variant="simple" class="mb-4 ml-30">{{ $form.username.error.message }}</Message>
                    <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple" class="mb-4 ml-30">{{ $form.password.error.message }}</Message>
                    <div class="flex justify-end gap-2">
                        <Button type="submit" label="Sign In"></Button>
                    </div>
                    <div class="text-center mt-2">
                        Don't have an account? 
                        <span class="text-blue-600 cursor-pointer hover:underline" @click="showSignUp">Sign Up</span>
                    </div>
                </Form>
            </template>
        </Card>
        <Card v-if="activeForm ==='signup'" :style="{ width: '25rem' }">
            <template #title>
                <div class="flex justify-between items-center">
                    <span>Sign Up</span>
                </div>
            </template>
            <template #content>
                <Form v-slot="$form" :initialValues="signUpInitialValues" :resolver="signUpResolver" @submit="signUp">
                    <div class="flex items-center gap-4 mb-4">
                        <label for="username" class="font-semibold w-24">Username</label>
                        <InputText name="username" class="flex-auto" autocomplete="off" />
                    </div>
                    <div class="flex items-center gap-4 mb-4">
                        <label for="password" class="font-semibold w-24">Password</label>
                        <div class="flex flex-col grow">
                        <Password name="password" placeholder="Password" :feedback="false" toggleMask fluid />
                        </div>
                    </div>
                    <div class="flex items-center gap-4 mb-4">
                        <label for="confirmPassword" class="font-semibold w-24">Confirm Password</label>
                        <div class="flex flex-col grow">
                        <Password name="confirmPassword" placeholder="Confirm password" :feedback="false" toggleMask fluid />
                        </div>
                    </div>
                    <Message v-if="$form.username?.invalid" severity="error" size="small" variant="simple" class="mb-4 ml-30">{{ $form.username.error.message }}</Message>
                    <Message v-if="$form.password?.invalid" severity="error" size="small" variant="simple" class="mb-4 ml-30">{{ $form.password.error.message }}</Message>
                    <Message v-if="$form.confirmPassword?.invalid" severity="error" size="small" variant="simple" class="mb-4 ml-30">{{ $form.confirmPassword.error.message }}</Message>
                    <div class="flex justify-end gap-2">
                        <Button type="submit" label="Sign Up"></Button>
                    </div>
                    <div class="text-center mt-2">
                        Already have an account? 
                        <span class="text-blue-600 cursor-pointer hover:underline" @click="showSignIn">Sign In</span>
                    </div>
                </Form>
            </template>
        </Card>
    </div>
    
</template>

<style scoped></style>