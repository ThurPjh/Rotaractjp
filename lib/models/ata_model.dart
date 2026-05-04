import 'package:cloud_firestore/cloud_firestore.dart';

class AtaModel {
  final String id;
  final String titulo;
  final String data;
  final String conteudo; 

  AtaModel({
    required this.id,
    required this.titulo,
    required this.data,
    required this.conteudo,
  });

  factory AtaModel.fromFirestore(DocumentSnapshot doc) {
    Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
    return AtaModel(
      id: doc.id,
      titulo: data['titulo'] ?? '',
      data: data['data'] ?? '',
      conteudo: data['conteudo'] ?? '',
    );
  }
}