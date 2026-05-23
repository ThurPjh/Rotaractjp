import 'package:flutter/material.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:provider/provider.dart'; 
import '../models/usuario_model.dart';
import '../providers/theme_provider.dart';

class PerfilScreen extends StatelessWidget {
  final UsuarioModel usuario;
  const PerfilScreen({super.key, required this.usuario});

  @override
  Widget build(BuildContext context) {
    // CORREÇÃO: Buscando a instância do seu ThemeProvider herdado do main.dart
    final themeProvider = Provider.of<ThemeProvider>(context);
    final bool isDarkMode = themeProvider.themeMode == ThemeMode.dark;

    return Scaffold(
      appBar: AppBar(title: const Text('Meu Perfil')),
      body: Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const CircleAvatar(radius: 50, child: Icon(Icons.person, size: 50)),
            const SizedBox(height: 20),
            Text(
              usuario.nome,
              style: Theme.of(context).textTheme.titleLarge?.copyWith(fontWeight: FontWeight.bold),
            ),
            Text(
              usuario.cargo.toUpperCase(),
              style: Theme.of(context).textTheme.bodyMedium?.copyWith(color: Colors.grey),
            ),
            const SizedBox(height: 40),
            ElevatedButton.icon(
              onPressed: () => FirebaseAuth.instance.signOut(),
              icon: const Icon(Icons.exit_to_app),
              label: const Text('Sair do App'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red.shade50,
                foregroundColor: Colors.red, // Deixa o texto/ícone vermelho
              ),
            ),
            const SizedBox(height: 40),
            // CORREÇÃO: O Switch agora lê e altera o estado do seu ThemeProvider real
            ListTile(
              leading: Icon(
                isDarkMode ? Icons.dark_mode : Icons.light_mode,
              ),
              title: const Text("Modo Escuro"),
              trailing: Switch(
                value: isDarkMode,
                onChanged: (bool value) {
                  // Chama a função toggleTheme que você criou lá no seu ThemeProvider!
                  themeProvider.toggleTheme(value);
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}