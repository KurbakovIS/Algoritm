"""
CLI команды для управления данными
"""
import click
from sqlalchemy.orm import Session
from .db import SessionLocal
from .data_manager import DataManager


@click.group()
def cli():
    """Gamified Roadmap Platform CLI"""
    pass


@cli.command()
@click.option('--force', is_flag=True, help='Force reinitialize even if data exists')
@click.option('--roadmap-file', help='Path to roadmap data JSON file')
@click.option('--users-file', help='Path to users data JSON file')
@click.option('--progress-file', help='Path to progress data JSON file')
def init(force, roadmap_file, users_file, progress_file):
    """Initialize database with data"""
    db = SessionLocal()
    try:
        data_manager = DataManager(db)
        data_manager.initialize_data(
            roadmap_file=roadmap_file,
            users_file=users_file,
            progress_file=progress_file,
            force=force
        )
        click.echo("Database initialized successfully!")
    finally:
        db.close()


@cli.command()
def clear():
    """Clear all data from database"""
    if click.confirm('Are you sure you want to clear all data?'):
        db = SessionLocal()
        try:
            data_manager = DataManager(db)
            data_manager.clear_data()
            click.echo("Database cleared successfully!")
        finally:
            db.close()
    else:
        click.echo("Operation cancelled.")


@cli.command()
@click.option('--output-dir', default='data_export', help='Output directory for exported data')
def export(output_dir):
    """Export data to JSON files"""
    db = SessionLocal()
    try:
        data_manager = DataManager(db)
        data_manager.export_data(output_dir)
        click.echo(f"Data exported to {output_dir}/")
    finally:
        db.close()


@cli.command()
def status():
    """Show database status"""
    db = SessionLocal()
    try:
        from .models import RoadmapNode, User, Progress
        
        nodes_count = db.query(RoadmapNode).count()
        users_count = db.query(User).count()
        progress_count = db.query(Progress).count()
        
        click.echo(f"Database Status:")
        click.echo(f"  Roadmap Nodes: {nodes_count}")
        click.echo(f"  Users: {users_count}")
        click.echo(f"  Progress Records: {progress_count}")
        
        if nodes_count > 0:
            click.echo(f"  Database is initialized")
        else:
            click.echo(f"  Database is empty - run 'init' to initialize")
            
    finally:
        db.close()


if __name__ == '__main__':
    cli()
