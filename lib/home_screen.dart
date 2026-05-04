import 'package:flutter/material.dart';
import 'models/usuario_model.dart';
// Se você já tiver o modelo de eventos, importe-o aqui:
// import 'models/evento_model.dart'; 

class HomeScreen extends StatefulWidget {
  final UsuarioModel usuario;

  const HomeScreen({super.key, required this.usuario});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  @override
  Widget build(BuildContext context) {
    const Color rosaOficial = Color.fromRGBO(212, 19, 103, 1);

    return Scaffold(
      // 1. AppBar Personalizada com o Nome do Sócio
      appBar: AppBar(
        title: const Text("Rotaract JP", style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
        backgroundColor: Colors.white,
        foregroundColor: rosaOficial,
        elevation: 0,
        actions: [
          if (widget.usuario.role == 'adm')
            const Padding(
              padding: EdgeInsets.only(right: 16.0),
              child: Tooltip(
                message: "Administrador",
                child: Icon(Icons.verified_user, color: Colors.amber),
              ),
            ),
        ],
      ),

      body: SingleChildScrollView( // <--- Resolve o erro de "Overflow"
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 2. Card de Boas-vindas
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: rosaOficial,
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    "Olá, ${widget.usuario.nome}!",
                    style: const TextStyle(color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 5),
                  Text(
                    widget.usuario.cargo,
                    style: const TextStyle(color: Colors.white70, fontSize: 16),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 30),

            // 3. Seção de Próximos Eventos
            const Text(
              "Próximos Eventos",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 15),

            // Card de Exemplo (Depois faremos um ListView.builder aqui)
            Card(
              elevation: 2,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(15)),
              child: const ListTile(
                leading: Icon(Icons.calendar_month, color: rosaOficial),
                title: Text("Reunião Ordinária 05"),
                subtitle: Text("Sábado, às 19:00 - Casa da Amizade"),
                trailing: Icon(Icons.arrow_forward_ios, size: 16),
              ),
            ),

            const SizedBox(height: 20),

            // 4. Resumo de Presença (Visual)
            const Text(
              "Sua Frequência",
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 10),
            LinearProgressIndicator(
              value: 0.8, // Exemplo: 80% de presença
              backgroundColor: Colors.grey[200],
              color: rosaOficial,
              borderRadius: BorderRadius.circular(10),
              minHeight: 10,
            ),
            const SizedBox(height: 5),
            const Text("Você esteve em 8 de 10 reuniões", style: TextStyle(color: Colors.grey, fontSize: 12)),
          ],
        ),
      ),

      // 5. Botão de Ação Flutuante (Somente para ADM)
      floatingActionButton: widget.usuario.role == 'adm'
          ? FloatingActionButton.extended(
              onPressed: () => _mostrarDialogoNovoEvento(context),
              backgroundColor: rosaOficial,
              icon: const Icon(Icons.add, color: Colors.white),
              label: const Text("Novo Evento", style: TextStyle(color: Colors.white)),
            )
          : null,
    );
  }

  // Função para abrir o formulário de novo evento
  void _mostrarDialogoNovoEvento(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(25))),
      builder: (context) => Padding(
        padding: EdgeInsets.only(
          bottom: MediaQuery.of(context).viewInsets.bottom,
          top: 20, left: 20, right: 20
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text("Cadastrar Novo Evento", style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            const SizedBox(height: 20),
            const TextField(decoration: InputDecoration(labelText: "Título do Evento")),
            const TextField(decoration: InputDecoration(labelText: "Local")),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: () => Navigator.pop(context),
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(double.infinity, 50),
                backgroundColor: const Color.fromRGBO(212, 19, 103, 1),
              ),
              child: const Text("SALVAR EVENTO", style: TextStyle(color: Colors.white)),
            ),
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }
}