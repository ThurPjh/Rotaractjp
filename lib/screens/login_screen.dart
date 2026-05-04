import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _emailController = TextEditingController();
  final _senhaController = TextEditingController();
  bool _carregando = false;

  // Função que faz a mágica de entrar no app
  Future<void> _entrar() async {
    setState(() => _carregando = true);
    try {
      await FirebaseAuth.instance.signInWithEmailAndPassword(
        email: _emailController.text.trim(),
        password: _senhaController.text.trim(),
      );
      // O main.dart vai perceber a mudança e te jogar para a Home automaticamente
    } on FirebaseAuthException catch (e) {
      String erro = "Erro ao entrar";
      if (e.code == 'user-not-found') erro = "Usuário não encontrado.";
      if (e.code == 'wrong-password') erro = "Senha incorreta.";
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(erro), backgroundColor: Colors.red),
      );
    } finally {
      setState(() => _carregando = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    const Color rosaOficial = Color.fromRGBO(212, 19, 103, 1);

    return Scaffold(
      backgroundColor: Colors.white,
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(32.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              // Logo ou Ícone do Rotaract
              const Icon(Icons. people_alt_rounded, size: 80, color: rosaOficial),
              const SizedBox(height: 16),
              const Text(
                "Rotaract JP",
                style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: rosaOficial),
              ),
              const Text("Gestão de Sócios e Atas", style: TextStyle(color: Colors.grey)),
              const SizedBox(height: 48),

              // Campo de E-mail
              TextField(
                controller: _emailController,
                decoration: InputDecoration(
                  labelText: "E-mail",
                  prefixIcon: const Icon(Icons.email_outlined),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                keyboardType: TextInputType.emailAddress,
              ),
              const SizedBox(height: 16),

              // Campo de Senha
              TextField(
                controller: _senhaController,
                decoration: InputDecoration(
                  labelText: "Senha",
                  prefixIcon: const Icon(Icons.lock_outline),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
                obscureText: true,
              ),
              const SizedBox(height: 24),

              // Botão de Entrar
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  onPressed: _carregando ? null : _entrar,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: rosaOficial,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: _carregando 
                    ? const CircularProgressIndicator(color: Colors.white) 
                    : const Text("ENTRAR", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}