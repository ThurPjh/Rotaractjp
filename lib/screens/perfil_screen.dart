import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import '../models/usuario_model.dart';

class PerfilScreen extends StatelessWidget {
  final UsuarioModel usuario;
  const PerfilScreen({super.key, required this.usuario});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Meu Perfil')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircleAvatar(radius: 50, child: Icon(Icons.person, size: 50)),
            const SizedBox(height: 20),
            Text(usuario.nome, style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            Text(usuario.cargo.toUpperCase(), style: const TextStyle(color: Colors.grey)),
            const SizedBox(height: 40),
            ElevatedButton.icon(
              onPressed: () => FirebaseAuth.instance.signOut(),
              icon: const Icon(Icons.exit_to_app),
              label: const Text('Sair do App'),
              style: ElevatedButton.styleFrom(backgroundColor: Colors.red.shade50),
            ),
          ],
        ),
      ),
    );
  }
}