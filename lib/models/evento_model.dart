import 'package:cloud_firestore/cloud_firestore.dart';

class Evento {
  final String id;
  final String nome;
  final String descricao;
  final DateTime data; // Alterado para DateTime
  final List<String> presencas;

  Evento({
    required this.id,
    required this.nome,
    required this.descricao,
    required this.data,
    required this.presencas,
  });

  factory Evento.fromFirestore(DocumentSnapshot doc) {
    final dataMap = doc.data() as Map<String, dynamic>?;

    // Converte de forma segura o que vier do Firebase para o DateTime do Flutter
    DateTime dataTratada;
    var firestoreData = dataMap?['data'];
    
    if (firestoreData is Timestamp) {
      dataTratada = firestoreData.toDate(); // Se for Timestamp no Firebase
    } else if (firestoreData is String && firestoreData.isNotEmpty) {
      dataTratada = DateTime.tryParse(firestoreData) ?? DateTime.now(); // Se for String
    } else {
      dataTratada = DateTime.now(); // Se estiver vazio/nulo
    }

    return Evento(
      id: doc.id,
      nome: dataMap?['nome'] ?? 'Evento sem nome',
      descricao: dataMap?['descricao'] ?? '',
      data: dataTratada,
      presencas: List<String>.from(dataMap?['presencas'] ?? []),
    );
  }
}